'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { syncSiteHostingContractVersion } = require('./sync-site-hosting-contract-version');

test('the checked-out Site Hosting declarations match the canonical contract version', () => {
    const root = path.resolve(__dirname, '../..');
    const result = syncSiteHostingContractVersion(root, { check: true });
    const contract = JSON.parse(fs.readFileSync(path.join(root, 'amade/spec/site-hosting-contract-version.json'), 'utf8'));
    assert.equal(result.version, contract.version);
});

test('one Amade version source synchronizes package manifests, schemas, and current documentation', () => {
    const sourceRoot = path.resolve(__dirname, '../..');
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'amade-site-contract-version-'));
    const copy = (relativePath) => {
        const source = path.join(sourceRoot, relativePath);
        const destination = path.join(tempRoot, relativePath);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(source, destination);
    };
    try {
        copy('amade/catalog/index.json');
        copy('amade/spec/site-hosting-contract-version.json');
        copy('amade/spec/site-hosting-family-v0.1.schema.json');
        copy('amade/spec/site-hosting-template-v0.1.schema.json');
        copy('amade/spec/README.md');
        copy('amade/spec/site-hosting-family-v0.1-draft.md');
        const index = JSON.parse(fs.readFileSync(path.join(tempRoot, 'amade/catalog/index.json'), 'utf8'));
        for (const family of index.families) {
            copy(family.manifest);
            for (const template of family.templates) copy(template.manifest);
        }

        const versionPath = path.join(tempRoot, 'amade/spec/site-hosting-contract-version.json');
        const config = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
        config.version = '0.1.0-dev99';
        fs.writeFileSync(versionPath, `${JSON.stringify(config, null, 2)}\n`);
        syncSiteHostingContractVersion(tempRoot);
        assert.equal(syncSiteHostingContractVersion(tempRoot, { check: true }).version, '0.1.0-dev99');

        const family = JSON.parse(fs.readFileSync(path.join(tempRoot, index.families[0].manifest), 'utf8'));
        assert.equal(family.spec_version, '0.1.0-dev99');
        assert.equal(family.content_contract_version, '0.1.0-dev99');
        const template = JSON.parse(fs.readFileSync(path.join(tempRoot, index.families[0].templates[0].manifest), 'utf8'));
        assert.equal(template.spec_version, '0.1.0-dev99');
        assert.equal(template.compatibility.contract.version, '0.1.0-dev99');
        const readme = fs.readFileSync(path.join(tempRoot, 'amade/spec/README.md'), 'utf8');
        assert.match(readme, /Site Hosting Contract is currently `0\.1\.0-dev99`/);
        assert.match(readme, /Contract `0\.1\.0-dev2` adds a `frontmatter_match`/);
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
});
