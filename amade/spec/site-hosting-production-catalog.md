# Site Hosting production catalog

## Purpose

Amade `dev` is the broad development catalog. Production consumers need a separately curated list so experimental and test templates can remain in the repository without appearing in the production app.

## Catalog ownership

- `amade/catalog/index.json` is the development catalog. It can contain all active development templates.
- `amade/catalog/production-index.json` is the production allowlist. Only Family and Template references and UI Style references listed here may be offered by BlogGenius production.
- Production catalog references must resolve to resources in the same repository revision and must be a subset of the development catalog. The validator checks Template manifests, exact Content Model pins, seed, preview, and Astro build inputs, plus active Style manifests.
- Template lifecycle status (`active`, `deprecated`, or `withdrawn`) continues to describe whether a resource can be selected inside a catalog. It does not decide production inclusion by itself.
- No per-template `production` boolean is added. The curated catalog is the single source of truth for production selection.

The production catalog selects only `company-atelier` from the `company-homepage` Family and the ten active Styles other than `remote-test-style`. Development-only Styles must not be listed in production.

## BlogGenius behavior

BlogGenius production uses the `main` branch's `production-index.json`; local/development environments continue to use the `dev` branch's `index.json` for both Templates and Styles. Template and Style caches are isolated by environment so an offline development cache cannot populate production choices.

BlogGenius UI Style uses the same development-versus-production catalog split as Site Hosting Templates. Production consumers read only the explicitly selected Style references in `production-index.json`.

## Validation and integration

`node amade/scripts/validate-production-catalog.js` validates catalog structure and package references. Add `--build` to install and build each selected production Template. The GitHub Actions workflow runs this check for pull requests and pushes to `main`; it validates and builds but does not deploy or publish resources.

Repository administrators may mark the workflow check as required in branch protection if merges to `main` must be blocked when validation fails. The workflow file alone does not change branch protection settings.
