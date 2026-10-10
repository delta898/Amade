# Site Hosting Family Contract Version Alignment

## Branch and status

- Branch: `codex/site-hosting-family-contract-version`
- Start date: 2026-10-11
- Base branch: `dev`
- Status: Implementation and focused validation complete; awaiting integration.
- Integration path: feature branch -> `dev` -> `main` after validation and user approval.

## Need and goal

BlogGenius validates that the Site Hosting Family declares both `spec_version` and `content_contract_version` equal to Amade's canonical contract version. Amade's current v0.2 synchronizer, schema, and tests omit `content_contract_version`, so the two repositories disagree and the cross-repository contract check fails. Align Amade's version source, Family manifests, schema, validation, tests, and current documentation.

## Scope

- Require `content_contract_version` in the current v0.2 Family schema and keep it synchronized from the single contract version source.
- Add the field to current Family manifests and relevant test fixtures.
- Validate both Family version fields against the canonical version.
- Update current contract documentation and retain the independently versioned v0.1 history.

## Non-goals

- Do not change the selected contract version or any Template package version.
- Do not change Family's grouping role, Content Model semantics, or BlogGenius code in this Amade feature branch.
- Do not modify the legacy v0.1 schema or historical experiment packages.
- Do not merge or push without an explicit request.

## Design and stages

The contract version remains `0.2.0-dev1`. Family `spec_version` and `content_contract_version`, Content Model `spec_version`, Template `spec_version`, and Template `compatibility.contract.version` must all be synchronized to that one source. The added Family field makes this cross-consumer contract explicit; it does not change Family's grouping-only responsibility.

1. Update the v0.2 Family schema, version synchronizer, validator, and synchronization tests.
2. Update current Family manifests and current contract documentation.
3. Run focused Amade contract/catalog checks and BlogGenius's cross-repository contract verifier.

## User decision and tradeoff

- User asked to fix Amade first after the dev merge gate exposed the Family field mismatch.
- The version is already user-approved as `0.2.0-dev1`; this change synchronizes an existing version and does not bump it.
- The extra explicit field duplicates the version value, so the synchronizer and validators must prevent drift.

## Progress and verification

- Confirmed Amade `dev` is at `26a351e` and has no pre-existing worktree changes. The feature branch is based on `dev`.
- Confirmed the current synchronizer intentionally omits the field and its test asserts absence; current Family schema likewise omits it. The BlogGenius cross-repository verifier therefore cannot pass against Amade as checked out.
- Updated the shared-version contract in the Family schema, synchronizer, production catalog validator, current Family manifests, relevant tests, and current 0.2 documentation.
- `node --test amade/scripts/sync-site-hosting-contract-version.test.js amade/scripts/validate-production-catalog.test.js`: 9 passed.
- `node amade/scripts/sync-site-hosting-contract-version.js --check`: passed; 20 declarations are synchronized to `0.2.0-dev1`.
- `node amade/scripts/validate-production-catalog.js`: passed; 1 production template and 10 styles validated.
- BlogGenius `node scripts/verify-site-hosting-contract.js --amade-root ../Amade` and its 2 focused contract tests passed against this branch.
- BlogGenius full unit runner passed: 2,220 passed, 15 skipped, 0 failed. The standard `npm run test:unit` security precheck remains a separate blocker from the parent release task.
- One initial synchronizer test exposed that the Family schema's `content_contract_version.const` also needed to be updated from the version source; the synchronizer now updates it and all focused tests pass.
- `git diff --check dev` passed. No build or manual UI check is relevant to this manifest/schema-only change.

## Final result

The Family's `content_contract_version` now matches its `spec_version` and the shared Amade contract version, enforced by the current schema, synchronizer, production catalog validator, tests, and documentation. Feature branch has not yet been committed, merged, pushed, or deleted.
