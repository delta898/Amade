'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const CONTRACT_VERSION_FILE = 'amade/spec/site-hosting-contract-version.json';
const DEVELOPMENT_CATALOG_FILE = 'amade/catalog/index.json';
const PRODUCTION_CATALOG_FILE = 'amade/catalog/production-index.json';
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateProductionCatalog(root = path.resolve(__dirname, '../..'), { build = false, npm = 'npm' } = {}) {
    const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
    const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
    const contract = readJson(CONTRACT_VERSION_FILE);
    const version = String(contract.version || '');
    const development = readJson(DEVELOPMENT_CATALOG_FILE);
    const production = readJson(PRODUCTION_CATALOG_FILE);
    requireValue(development?.spec_version === '0.1.0' && development.status === 'experimental' && Array.isArray(development.families), 'Development catalog format is invalid.');
    requireValue(production?.spec_version === '0.1.0' && production.status === 'experimental'
        && production.catalog_id === 'amade-production' && Array.isArray(production.families) && Array.isArray(production.styles), 'Production catalog format is invalid.');
    requireValue(Array.isArray(development.styles), 'Development catalog styles are invalid.');

    const resolveRepoPath = (value, expectedPrefix) => {
        const normalized = String(value || '').replaceAll('\\', '/');
        requireValue(normalized && !normalized.startsWith('/') && !normalized.split('/').some((part) => !part || part === '.' || part === '..'), `Unsafe repository path: ${value}`);
        requireValue(normalized.startsWith(expectedPrefix), `Repository path must be under ${expectedPrefix}: ${value}`);
        const resolved = path.resolve(root, normalized);
        requireValue(resolved.startsWith(`${path.resolve(root)}${path.sep}`), `Repository path escapes the checkout: ${value}`);
        return { normalized, resolved };
    };
    const developmentFamilies = new Map();
    for (const entry of development.families) {
        requireValue(ID_PATTERN.test(String(entry?.family_id || '')) && Array.isArray(entry.templates), 'Development family entry is invalid.');
        developmentFamilies.set(entry.family_id, entry);
    }
    const selectedTemplates = new Set();
    const selectedFamilies = new Set();
    for (const familyEntry of production.families) {
        const familyId = String(familyEntry?.family_id || '');
        requireValue(ID_PATTERN.test(familyId) && !selectedFamilies.has(familyId) && Array.isArray(familyEntry.templates) && familyEntry.templates.length > 0, `Production family entry is invalid: ${familyId}`);
        selectedFamilies.add(familyId);
        const devFamily = developmentFamilies.get(familyId);
        requireValue(devFamily && devFamily.manifest === familyEntry.manifest, `Production Family is not present in the development catalog: ${familyId}`);
        const familyManifestPath = resolveRepoPath(familyEntry.manifest, 'amade/families/').normalized;
        const family = readJson(familyManifestPath);
        requireValue(family.family_id === familyId && family.spec_version === version, `Production Family manifest mismatch: ${familyId}`);

        const devTemplateRefs = new Map(devFamily.templates.map((entry) => [entry.template_id, entry.manifest]));
        for (const templateEntry of familyEntry.templates) {
            const templateId = String(templateEntry?.template_id || '');
            requireValue(ID_PATTERN.test(templateId) && !selectedTemplates.has(templateId), `Duplicate or invalid production Template ID: ${templateId}`);
            selectedTemplates.add(templateId);
            requireValue(devTemplateRefs.get(templateId) === templateEntry.manifest, `Production Template is not present in its development Family: ${templateId}`);
            const manifestPath = resolveRepoPath(templateEntry.manifest, 'amade/templates/').normalized;
            const template = readJson(manifestPath);
            requireValue(template.template_id === templateId && template.family_id === familyId && template.status === 'active', `Production Template is not active or its manifest identity is mismatched: ${templateId}`);
            requireValue(template.spec_version === version && template.compatibility?.contract?.version === version
                && (contract.contract_ids || []).includes(template.compatibility?.contract?.id), `Production Template contract is unsupported: ${templateId}`);

            const modelManifestPath = resolveRepoPath(template.content_model?.manifest, 'amade/content-models/').normalized;
            const model = readJson(modelManifestPath);
            requireValue(model.spec_version === version && model.model_id === template.content_model.model_id
                && model.model_version === template.content_model.model_version, `Production Content Model pin is invalid: ${templateId}`);

            const packageRoot = path.dirname(path.join(root, manifestPath));
            const insidePackage = (relativePath, label) => {
                const value = String(relativePath || '').replaceAll('\\', '/');
                requireValue(value && !value.startsWith('/') && !value.split('/').some((part) => !part || part === '.' || part === '..'), `${label} path is unsafe: ${templateId}`);
                const target = path.resolve(packageRoot, value);
                requireValue(target.startsWith(`${packageRoot}${path.sep}`), `${label} path escapes the Template package: ${templateId}`);
                return target;
            };
            const astroRoot = insidePackage(template.astro_project, 'Astro project');
            const seedRoot = insidePackage(template.site_data_seed, 'site-data seed');
            const preview = insidePackage(template.preview, 'Preview');
            requireValue(fs.existsSync(path.join(astroRoot, 'package.json')) && fs.existsSync(path.join(astroRoot, 'package-lock.json')),
                `Production Template has no locked Astro project dependencies: ${templateId}`);
            requireValue(fs.existsSync(preview), `Production Template preview is missing: ${templateId}`);
            const seedFile = path.join(seedRoot, 'site.json');
            requireValue(fs.existsSync(seedFile), `Production Template seed has no site.json: ${templateId}`);
            const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
            requireValue(String(seed.displayName || '').trim() && Array.isArray(seed.navigation), `Production Template seed site.json is invalid: ${templateId}`);

            if (build) {
                const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), `amade-production-${templateId}-`));
                try {
                    const stagedAstroRoot = path.join(stagingRoot, 'template', 'astro');
                    fs.mkdirSync(path.dirname(stagedAstroRoot), { recursive: true });
                    fs.cpSync(astroRoot, stagedAstroRoot, {
                        recursive: true,
                        filter: (source) => !['node_modules', 'dist'].includes(path.basename(source))
                    });
                    fs.cpSync(seedRoot, path.join(stagingRoot, 'site-data'), { recursive: true });
                    const install = spawnSync(npm, ['ci'], { cwd: stagedAstroRoot, stdio: 'inherit' });
                    if (install.error) throw install.error;
                    requireValue(install.status === 0, `npm ci failed for production Template ${templateId}.`);
                    const result = spawnSync(npm, ['run', 'build'], { cwd: stagedAstroRoot, stdio: 'inherit' });
                    if (result.error) throw result.error;
                    requireValue(result.status === 0, `Astro build failed for production Template ${templateId}.`);
                } finally {
                    fs.rmSync(stagingRoot, { recursive: true, force: true });
                }
            }
        }
    }

    const developmentStyles = new Map(development.styles.map((entry) => [entry?.style_id, entry?.manifest]));
    const selectedStyles = new Set();
    for (const styleEntry of production.styles) {
        const styleId = String(styleEntry?.style_id || '');
        const expectedManifest = `amade/styles/${styleId}/style.json`;
        requireValue(ID_PATTERN.test(styleId) && !selectedStyles.has(styleId), `Duplicate or invalid production Style ID: ${styleId}`);
        selectedStyles.add(styleId);
        requireValue(developmentStyles.get(styleId) === styleEntry.manifest && styleEntry.manifest === expectedManifest,
            `Production Style is not present in the development catalog: ${styleId}`);
        const manifestPath = resolveRepoPath(styleEntry.manifest, 'amade/styles/').normalized;
        const style = readJson(manifestPath);
        requireValue(style.spec_version === '0.1.0' && style.style_id === styleId && style.status === 'active',
            `Production Style is not active or its manifest identity is mismatched: ${styleId}`);
    }

    return { contractVersion: version, familyCount: selectedFamilies.size, templateCount: selectedTemplates.size, styleCount: selectedStyles.size };
}

if (require.main === module) {
    try {
        const result = validateProductionCatalog(process.cwd(), { build: process.argv.includes('--build') });
        process.stdout.write(`Production catalog is valid: ${result.templateCount} Templates, ${result.styleCount} Styles, contract ${result.contractVersion}.\n`);
    } catch (error) {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
    }
}

module.exports = { validateProductionCatalog };
