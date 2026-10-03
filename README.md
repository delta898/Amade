# Amade

Amade는 BlogGenius가 외부에서 가져오는 버전 관리형 사이트 템플릿과 외모 스타일 catalog입니다. 리소스는 이 저장소에서 검토·관리하며, BlogGenius는 공개 catalog와 각 리소스의 고정된 Git revision을 읽습니다.

## 제공 리소스

### Site Hosting (`site-hosting`)

일반 Astro 프로젝트를 복사해 새 BlogGenius Site를 만드는 템플릿입니다. 리소스는 미리보기, 설명, 제작자, 라이선스, 지원 링크, 사용자 설정, 빌드 경로와 글 저장 위치·URL 규칙을 선언합니다. 공개 dev 카탈로그는 `Astro Homepage 1.2.0`과 `Studio Journal 1.2.0`을 제공합니다. Studio Journal은 StaticWeb의 두 Astro 사이트에서 검증된 소개 페이지와 글 목록·상세 패턴을 브랜드 중립적으로 재구성했습니다.

BlogGenius의 사이트 생성 화면은 개발 환경에서 `dev`, 운영 환경에서 `main` 카탈로그를 조회합니다. Amade catalog에 새 리소스나 새 버전을 등록하면 해당 환경의 템플릿 목록에 반영됩니다.

### BlogGenius Style (`bloggenius-style`)

`BlogGenius > 설정 > 앱 > 외모`에서 고르는 스타일 팩입니다. 임의의 앱 코드 대신 BlogGenius의 semantic design token 값으로 구성합니다. 현재는 리소스 형식만 정의되어 있으며, BlogGenius에서 외부 스타일을 조회하고 적용하는 기능은 후속 개발입니다.

## 저장소 구조

- `amade/catalog/index.json` — 공식 리소스 목록. 각 항목은 유형, ID, 버전, manifest 경로와 불변 Git commit revision을 가리킵니다.
- `amade/spec/` — 공통 catalog/resource 규격과 각 리소스 유형별 JSON Schema.
- `amade/templates/site-hosting/{id}/{version}/` — 버전이 고정된 Site Hosting 패키지, 미리보기, manifest와 라이선스.
- `amade/templates/bloggenius-style/{id}/{version}/` — 향후 Style 패키지 위치.

리소스 manifest는 파일별 SHA-256 checksum을 선언합니다. BlogGenius는 해당 파일을 내려받을 때 checksum을 검사하고 Site에 선택된 리소스 revision을 기록합니다. 기존 리소스 버전의 내용을 바꾸지 말고, 변경은 새 버전으로 추가한 뒤 catalog를 갱신하세요.

## 새 리소스를 추가하는 흐름

1. 유형별 schema에 맞춰 버전 폴더에 패키지와 preview를 추가합니다.
2. manifest에 ID, 버전, 라이선스, 호환성, 파일 checksum과 유형별 설정을 기록합니다.
3. 패키지를 별도 Git commit으로 고정합니다.
4. 그 commit SHA와 manifest 경로를 `amade/catalog/index.json`에 등록합니다.
5. 변경을 검토한 뒤 pull request로 제출합니다.

현재 catalog는 관리자가 검토해 반영합니다. 사용자 업로드, 공개 marketplace, 평점·결제 기능은 포함하지 않습니다. 각 리소스는 manifest에 자체 라이선스를 명시하며, 현재 Astro Homepage 패키지는 MIT입니다.

## 규격 간단 안내

상세 규격, Astro project를 template으로 패키징하는 방법, manifest 필드, 버전 발행·갱신 절차는 [`amade/spec/README.md`](amade/spec/README.md)를 참고하세요. 규격 또는 지원 동작을 바꾸면 이 문서도 같은 변경에서 갱신합니다.

- `catalog-index-v1.schema.json`: BlogGenius가 받아보는 전체 목록과 각 resource의 고정 revision을 검사합니다.
- `resource.schema.json`: 모든 resource가 공유하는 ID, kind, version, 이름, preview, 라이선스, 호환성, package/checksum 형식입니다. `kind`에 따라 해당 유형의 세부 manifest를 요구합니다.
- `site-hosting-v1.schema.json`: Astro source와 build/output, 사용자가 변경할 수 있는 필드 및 그 저장 위치, 게시 글의 content 경로와 URL/frontmatter 규칙입니다.
- `bloggenius-style-v1.schema.json`: `bloggenius-style-tokens-1.0`에 필요한 semantic token을 빠짐없이 제공하는 데이터 전용 Style 형식입니다.

두 리소스 유형은 catalog와 공통 resource envelope를 공유하지만 세부 스키마와 소비 기능은 분리되어 있습니다.
