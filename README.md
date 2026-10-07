# Amade

Amade는 BlogGenius가 외부에서 가져오는 버전 관리형 사이트 템플릿과 외모 스타일 catalog입니다. 리소스는 이 저장소에서 검토·관리하며, BlogGenius는 공개 catalog와 각 리소스의 고정된 Git revision을 읽습니다.

> **규격 세대 주의:** `dev`의 `amade/catalog/index.json`은 Site Hosting Template Family **0.1.0 experimental** grouped catalog이며 BlogGenius 개발 환경이 이를 읽습니다. 기존 1.x 패키지와 문서는 legacy로 보존되어 있으나 새 catalog에는 포함하지 않습니다. `main`은 production 전환 전까지 기존 정책대로 별도 관리합니다. 두 형식은 호환되지 않습니다.

## 규격 세대

| 규격 | 문서 / 위치 | 현재 역할 |
| --- | --- | --- |
| Amade resource v1 (legacy) | [`amade/spec/README.md`](amade/spec/README.md), 역사적 `amade/templates/site-hosting/` 경로 | 기존 패키지 형식과 당시 연동 동작을 참고용으로 기록합니다. 신규 0.1 템플릿에 적용하지 않습니다. |
| Site Hosting Template Family 0.1.0 (experimental) | [`spec draft`](amade/spec/site-hosting-family-v0.1-draft.md), `amade/families/`, `amade/templates/` | Family 계약, 템플릿 metadata/status, 공통 site-data 및 4개 Astro 템플릿을 정의합니다. dev catalog와 BlogGenius 개발 환경에 연결되어 검증 중입니다. |
| BlogGenius UI Style 0.1 / token contract 1.1 | [`UI Style schema`](amade/spec/bloggenius-ui-style-v0.1.schema.json), [`token schema`](amade/spec/bloggenius-ui-style-tokens-v1.1.schema.json), `amade/styles/` | dev grouped catalog에서 Style 패키지를 공급합니다. BlogGenius는 선택한 원격 패키지를 로컬 캐시에 적용하고, bundled theme은 fallback입니다. |

## 제공 리소스 (dev: Site Hosting Family 0.1.0)

dev catalog groups templates by family: Personal Homepage (`personal-post-list`, `personal-card-grid`) and Company Homepage (`company-service-cards`, `company-service-list`). Packages are under `amade/families/` and `amade/templates/`; the four templates are experimental and offered for development validation. Legacy v1 package files remain in their historical folders and are not listed in the 0.1 catalog.

## Legacy v1 리소스 참고

### Site Hosting (`site-hosting`)

일반 Astro 프로젝트를 복사해 새 BlogGenius Site를 만드는 템플릿입니다. Legacy v1 리소스는 미리보기, 설명, 제작자, 라이선스, 지원 링크, 사용자 설정, 빌드 경로와 글 저장 위치·URL 규칙을 선언합니다. 과거 v1 dev catalog에는 `Astro Homepage 1.3.0`과 `Studio Journal 1.3.0`이 있었습니다. Studio Journal은 StaticWeb의 두 Astro 사이트에서 검증된 소개 페이지와 글 목록·상세 패턴을 브랜드 중립적으로 재구성했습니다.

이 설명은 legacy v1 catalog 동작의 기록입니다. 현재 dev Site Hosting은 Template Family 0.1.0 grouped catalog를 사용하며, 새 템플릿은 `active` 상태일 때 선택 목록에 표시됩니다.

### BlogGenius Style (`bloggenius-style`)

`BlogGenius > 설정 > 앱 > 외모`에서 고르는 스타일 팩입니다. 임의의 앱 코드 대신 BlogGenius의 semantic design token 값으로 구성합니다. BlogGenius는 Amade dev catalog에서 패키지를 가져와 로컬에 캐시하고 적용하며, 내장 테마는 원격 스타일을 사용할 수 없을 때의 fallback입니다. UI Style token 계약은 1.1이며 테스트 전용 `remote-test-style`은 운영 스타일 패키지 갱신 대상이 아닙니다.

## 저장소 구조

- `amade/catalog/index.json` — 현재 dev family 목록. 각 family는 family manifest와 순서가 있는 template 목록을 가리킵니다. BlogGenius는 catalog branch의 commit SHA를 pinning 기준으로 사용합니다.
- `amade/spec/` — 공통 catalog/resource 규격과 각 리소스 유형별 JSON Schema.
- `amade/families/{family-id}/` — family manifest 및 초기 site-data seed.
- `amade/templates/{template-id}/` — complete Astro project, preview/screenshots 및 template manifest.
- `amade/templates/site-hosting/{id}/{version}/` — 보존된 legacy v1 Site Hosting 패키지.
- `amade/styles/{id}/style.json` — grouped catalog의 BlogGenius UI Style 패키지.

Legacy v1 resource manifest는 파일별 SHA-256 checksum을 선언하며 BlogGenius는 내려받을 때 이를 검사합니다. 0.1 packages are pinned to one immutable Amade Git commit revision; do not overwrite a published template package version.

### Site Hosting 계약 확인

Site Hosting manifest와 schema 버전 동기화는 `node --test amade/scripts/sync-site-hosting-contract-version.test.js`로 확인합니다. 이 테스트는 현재 체크아웃의 선언값 일치도 검사합니다. 계약 버전을 명시적으로 변경한 뒤에는 `node amade/scripts/sync-site-hosting-contract-version.js`로 선언을 갱신하고 테스트를 다시 실행하세요.

## Legacy v1 리소스 형식

기존 v1 파일의 위치와 동작은 아래 legacy 문서를 참고합니다. 신규 Site Hosting 템플릿은 0.1 family 규격을 사용하며 v1 schema로 검증하지 않습니다.

현재 catalog는 관리자가 검토해 반영합니다. 사용자 업로드, 공개 marketplace, 평점·결제 기능은 포함하지 않습니다. 각 리소스는 manifest에 자체 라이선스를 명시하며, 현재 Astro Homepage 패키지는 MIT입니다.

## Legacy v1 규격 간단 안내

상세 규격, Astro project를 template으로 패키징하는 방법, manifest 필드, 버전 발행·갱신 절차는 [`amade/spec/README.md`](amade/spec/README.md)를 참고하세요. 규격 또는 지원 동작을 바꾸면 이 문서도 같은 변경에서 갱신합니다.

- `catalog-index-v1.schema.json`: BlogGenius가 받아보는 전체 목록과 각 resource의 고정 revision을 검사합니다.
- `resource.schema.json`: 모든 resource가 공유하는 ID, kind, version, 이름, preview, 라이선스, 호환성, package/checksum 형식입니다. `kind`에 따라 해당 유형의 세부 manifest를 요구합니다.
- `site-hosting-v1.schema.json`: Astro source와 build/output, 사용자가 변경할 수 있는 필드 및 그 저장 위치, 게시 글의 content 경로와 URL/frontmatter 규칙입니다.
- `bloggenius-style-v1.schema.json`: legacy v1 Style format; current grouped-catalog Styles use `bloggenius-ui-style-v0.1.schema.json` and token contract 1.1.

두 v1 리소스 유형은 catalog와 공통 resource envelope를 공유하지만 세부 스키마와 소비 기능은 분리되어 있습니다. 이 설명은 v1에만 적용됩니다. 0.1.0의 공통 metadata, lifecycle status, family grouping 규칙은 새 spec draft가 기준입니다.
