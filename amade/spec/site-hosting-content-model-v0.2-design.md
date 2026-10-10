# Site Hosting Contract 0.2.0-dev1: Family and Content Model roles

Status: implementation and verification in progress. The shared contract version is the user-approved `0.2.0-dev1`; this is not yet a stable release.

## Contract roles

- **Family** is catalog grouping only. It owns `family_id`, display name, description, and ordered Template membership. It does not define compatibility, content, setup inputs, routes, seed data, or switching behavior.
- **Content Model** is a versioned reusable dependency. It owns the supported site profile fields, navigation shape, media conventions, content types, frontmatter rules, routes, and publishing semantics. A model is referenced by exact `model_id` and `model_version` from a Template and is not a selectable catalog card.
- **Template** owns its runnable Astro project, preview, supported setup inputs, customization surfaces, and initial `site-data` seed. It pins one Content Model and is the unit selected when creating a Site.
- **Site** records its selected Template and exact Content Model identity/version. Its copied `site-data` remains durable across an update to that same Template. A different Template is a separate selection; Family membership does not promise interchangeability or data conversion.

## Repository and manifest layout

```text
amade/
  families/<family-id>/family.json
  content-models/<model-id>/content-model.json
  templates/<template-id>/
    template.json
    site-data/                 # this Template's own initial seed
    astro/                     # runnable presentation project
```

A Template manifest declares `content_model: { model_id, model_version, manifest }` and `site_data_seed`. The model manifest describes data meaning and constraints, not where a particular Template stores its seed in the Amade repository. `site_data_seed` points to a directory inside the Template package and must contain `site.json`.

The catalog can continue to group templates under `families[]`. A consumer resolves Family for display, Template for package and seed, and Content Model for behavior. It must pin all reads to one immutable repository revision and validate that the references and IDs agree.

## Versioning

The unified Site Hosting contract version is `0.2.0-dev1` across Family `spec_version` and `content_contract_version`, Template `spec_version`, Content Model `spec_version`, and Template `compatibility.contract.version`. The Template's package `version` and Content Model's `model_version` are independent version axes. Contract edits require the user to choose the next exact shared contract version before any version field changes.

The v0.1 Family-based manifests and schemas remain preserved as historical input. BlogGenius should resolve them through an explicit legacy adapter where it can validate the old contract. It must not infer a Content Model from matching Family names. If a legacy contract cannot be resolved safely, the affected action should report an incompatibility rather than silently apply a guessed model.

## Update and compatibility rules

- Template update availability is based on the exact selected Template identity and a compatible pinned Content Model, never Family ID equality.
- Updating a Template replaces only the managed Astro project path and preserves BlogGenius metadata and Site `site-data`.
- A Content Model version mismatch is not an implicit data migration. The current contract does not define cross-Template switching or automatic Content Model conversion.
- Family name, categories, and tags are for catalog presentation and do not confer capabilities.

## Validation scope

Before treating this contract as stable, validate each Template manifest against the v0.2 Template schema, each Family and Content Model against their schemas, and the manifest references and seed package contents at one pinned revision. In BlogGenius, verify discovery, preview, creation, post-target eligibility, publishing paths, and update gating. Keep legacy v0.1 fixtures to ensure the compatibility adapter remains explicit and bounded.
