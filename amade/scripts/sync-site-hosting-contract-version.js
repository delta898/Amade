'use strict';

const fs = require('node:fs');
const path = require('node:path');

function syncSiteHostingContractVersion(root = path.resolve(__dirname, '../..'), { check = false } = {}) {
    const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    const writeJson = (file, value) => {
        const target = path.join(root, file);
        const next = `${JSON.stringify(value, null, 2)}\n`;
        const current = fs.readFileSync(target, 'utf8');
        if (JSON.stringify(JSON.parse(current)) === JSON.stringify(value)) return false;
        if (check) throw new Error(`${file} is out of sync with amade/spec/site-hosting-contract-version.json`);
        fs.writeFileSync(target, next);
        return true;
    };
    const contract = read('amade/spec/site-hosting-contract-version.json');
    const version = String(contract.version || '').trim();
    if (!/^\d+\.\d+\.\d+-dev\d+$/.test(version) || !Array.isArray(contract.contract_ids) || !contract.contract_ids.length) {
        throw new Error('Invalid Amade Site Hosting contract version source.');
    }

    const index = read('amade/catalog/index.json');
    const changed = [];
    for (const familyRef of index.families || []) {
        const family = read(familyRef.manifest);
        family.spec_version = version;
        changed.push([familyRef.manifest, family]);
        for (const templateRef of familyRef.templates || []) {
            const template = read(templateRef.manifest);
            template.spec_version = version;
            if (!contract.contract_ids.includes(template.compatibility?.contract?.id)) {
                throw new Error(`${templateRef.manifest} uses a contract ID absent from the version source.`);
            }
            template.compatibility.contract.version = version;
            const model = read(template.content_model.manifest);
            if (model.model_id !== template.content_model.model_id || model.model_version !== template.content_model.model_version) {
                throw new Error(`${templateRef.manifest} references a mismatched Content Model.`);
            }
            model.spec_version = version;
            changed.push([templateRef.manifest, template], [template.content_model.manifest, model]);
        }
    }

    const familySchemaPath = 'amade/spec/site-hosting-family-v0.2.schema.json';
    const modelSchemaPath = 'amade/spec/site-hosting-content-model-v0.2.schema.json';
    const templateSchemaPath = 'amade/spec/site-hosting-template-v0.2.schema.json';
    const familySchema = read(familySchemaPath);
    familySchema.title = `Amade Site Hosting Template Family Contract ${version}`;
    familySchema.properties.spec_version.const = version;
    changed.push([familySchemaPath, familySchema]);
    const modelSchema = read(modelSchemaPath);
    modelSchema.title = `Amade Site Hosting Content Model ${version}`;
    modelSchema.properties.spec_version.const = version;
    changed.push([modelSchemaPath, modelSchema]);
    const templateSchema = read(templateSchemaPath);
    templateSchema.title = `Amade Site Hosting Template Contract ${version}`;
    templateSchema.allOf[1].properties.spec_version.const = version;
    templateSchema.allOf[1].properties.compatibility.properties.contract.properties.version.const = version;
    changed.push([templateSchemaPath, templateSchema]);

    for (const [file, value] of changed) writeJson(file, value);

    const updateDoc = (relativePath, replacements) => {
        const target = path.join(root, relativePath);
        let current = fs.readFileSync(target, 'utf8');
        let next = current;
        const changedRules = [];
        for (const [pattern, replacement] of replacements) {
            const updated = next.replace(pattern, replacement);
            if (updated !== next) changedRules.push(pattern.toString());
            next = updated;
        }
        if (current === next) return;
        if (check) throw new Error(`${relativePath} current-version references are out of sync (${changedRules.join(', ')}).`);
        fs.writeFileSync(target, next);
    };
    updateDoc('amade/spec/README.md', [
        [/Site Hosting Contract is currently `[^`]+`/, `Site Hosting Contract is currently \`${version}\``],
        [/Site Hosting Contract Version\*\*, currently `[^`]+`/, `Site Hosting Contract Version**, currently \`${version}\``],
        [/with contract version `[^`]+`/, `with contract version \`${version}\``],
        [/## Current Site Hosting content contract \([^)]*\)/, `## Current Site Hosting content contract (${version})`],
        [/Template and Family manifest `spec_version` plus Template `compatibility.contract.version`/, `Family, Content Model, and Template manifest \`spec_version\` plus Template \`compatibility.contract.version\``],
        [/Family, Content Model, and Template manifest `spec_version` plus Template `compatibility.contract.version` must all have this same value\./, `Family, Content Model, and Template manifest \`spec_version\` plus Template \`compatibility.contract.version\` must all have this same value.`],
        [/### Site profile and page metadata \([^)]*\)/, `### Site profile and page metadata (${version})`],
        [/\| Site Hosting Contract [^|]+\|/, `| Site Hosting Contract ${version} |`]
    ]);
    return { version, files: changed.length };
}

if (require.main === module) {
    try {
        const result = syncSiteHostingContractVersion(process.cwd(), { check: process.argv.includes('--check') });
        process.stdout.write(`${process.argv.includes('--check') ? 'Verified' : 'Synchronized'} ${result.files} Amade declarations to ${result.version}.\n`);
    } catch (error) {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
    }
}

module.exports = { syncSiteHostingContractVersion };
