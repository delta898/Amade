'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { validateProductionCatalog } = require('./validate-production-catalog');

const CONTRACT_VERSION = '0.2.0-dev1';

function createFixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'amade-production-catalog-'));
    const writeJson = (relativePath, value) => {
        const target = path.join(root, relativePath);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
    };
    const templateRef = 'amade/templates/sample-template/template.json';
    const familyRef = 'amade/families/sample-family/family.json';
    const modelRef = 'amade/content-models/sample-content/content-model.json';
    const catalog = { spec_version: '0.1.0', status: 'experimental', catalog_id: 'amade-official', name: 'Dev', families: [], styles: [] };
    const productionCatalog = { spec_version: '0.1.0', status: 'experimental', catalog_id: 'amade-production', name: 'Prod', families: [], styles: [] };
    writeJson('amade/spec/site-hosting-contract-version.json', { version: CONTRACT_VERSION, contract_ids: ['bloggenius-site-hosting-template'] });
    writeJson('amade/catalog/index.json', catalog);
    writeJson('amade/catalog/production-index.json', productionCatalog);

    const addTemplate = () => {
        const packageRoot = path.dirname(path.join(root, templateRef));
        fs.mkdirSync(path.join(packageRoot, 'astro'), { recursive: true });
        fs.mkdirSync(path.join(packageRoot, 'site-data'), { recursive: true });
        fs.writeFileSync(path.join(packageRoot, 'astro/package.json'), '{}\n');
        fs.writeFileSync(path.join(packageRoot, 'astro/package-lock.json'), '{}\n');
        fs.writeFileSync(path.join(packageRoot, 'site-data/site.json'), '{"displayName":"Sample","navigation":[]}\n');
        fs.writeFileSync(path.join(packageRoot, 'preview.svg'), '<svg/>\n');
        writeJson(familyRef, { spec_version: CONTRACT_VERSION, family_id: 'sample-family', name: 'Sample', description: 'Sample' });
        writeJson(modelRef, { spec_version: CONTRACT_VERSION, model_id: 'sample-content', model_version: '0.1.0' });
        writeJson(templateRef, {
            spec_version: CONTRACT_VERSION,
            template_id: 'sample-template',
            family_id: 'sample-family',
            status: 'active',
            astro_project: 'astro',
            site_data_seed: 'site-data',
            preview: 'preview.svg',
            content_model: { model_id: 'sample-content', model_version: '0.1.0', manifest: modelRef },
            compatibility: { contract: { id: 'bloggenius-site-hosting-template', version: CONTRACT_VERSION } }
        });
        const familyEntry = { family_id: 'sample-family', manifest: familyRef, templates: [{ template_id: 'sample-template', manifest: templateRef }] };
        catalog.families = [familyEntry];
        productionCatalog.families = [familyEntry];
        writeJson('amade/catalog/index.json', catalog);
        writeJson('amade/catalog/production-index.json', productionCatalog);
    };
    const addStyle = (styleId, { includeInDevelopment = true, includeInProduction = true, status = 'active' } = {}) => {
        const manifest = `amade/styles/${styleId}/style.json`;
        writeJson(manifest, { spec_version: '0.1.0', style_id: styleId, status });
        if (includeInDevelopment) catalog.styles.push({ style_id: styleId, manifest });
        if (includeInProduction) productionCatalog.styles.push({ style_id: styleId, manifest });
        writeJson('amade/catalog/index.json', catalog);
        writeJson('amade/catalog/production-index.json', productionCatalog);
    };
    return { root, addTemplate, addStyle, close: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test('empty production catalog is valid before any Template is promoted', () => {
    const fixture = createFixture();
    try {
        assert.deepEqual(validateProductionCatalog(fixture.root), { contractVersion: CONTRACT_VERSION, familyCount: 0, templateCount: 0, styleCount: 0 });
    } finally { fixture.close(); }
});

test('production catalog validates exact active Template, Content Model, and Template-owned seed references', () => {
    const fixture = createFixture();
    try {
        fixture.addTemplate();
        assert.equal(validateProductionCatalog(fixture.root).templateCount, 1);
    } finally { fixture.close(); }
});

test('production catalog rejects an unlisted development Template reference', () => {
    const fixture = createFixture();
    try {
        const file = path.join(fixture.root, 'amade/catalog/production-index.json');
        const value = JSON.parse(fs.readFileSync(file, 'utf8'));
        value.families.push({ family_id: 'missing', manifest: 'amade/families/missing/family.json', templates: [{ template_id: 'missing-template', manifest: 'amade/templates/missing-template/template.json' }] });
        fs.writeFileSync(file, JSON.stringify(value));
        assert.throws(() => validateProductionCatalog(fixture.root), /Production Family is not present in the development catalog/);
    } finally { fixture.close(); }
});

test('production catalog rejects inactive Templates', () => {
    const fixture = createFixture();
    try {
        fixture.addTemplate();
        const file = path.join(fixture.root, 'amade/templates/sample-template/template.json');
        const value = JSON.parse(fs.readFileSync(file, 'utf8'));
        value.status = 'deprecated';
        fs.writeFileSync(file, JSON.stringify(value));
        assert.throws(() => validateProductionCatalog(fixture.root), /Template is not active/);
    } finally { fixture.close(); }
});

test('production catalog accepts only active Styles referenced by development catalog', () => {
    const fixture = createFixture();
    try {
        fixture.addStyle('warm-editorial');
        assert.equal(validateProductionCatalog(fixture.root).styleCount, 1);
    } finally { fixture.close(); }
});

test('production catalog rejects Styles missing from development catalog or inactive', () => {
    const missing = createFixture();
    try {
        missing.addStyle('remote-test-style', { includeInDevelopment: false });
        assert.throws(() => validateProductionCatalog(missing.root), /Production Style is not present in the development catalog/);
    } finally { missing.close(); }

    const inactive = createFixture();
    try {
        inactive.addStyle('retired-style', { status: 'deprecated' });
        assert.throws(() => validateProductionCatalog(inactive.root), /Production Style is not active/);
    } finally { inactive.close(); }
});
