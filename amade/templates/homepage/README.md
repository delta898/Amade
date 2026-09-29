# {{site.name.md}}

Amade의 Homepage starter로 만든 Astro 정적 사이트입니다. 새 사이트 생성 시 복사되므로, 이후 Amade image를 갱신해도 이 앱 파일은 자동 변경되지 않습니다.

## 먼저 바꿀 내용

src/pages/index.astro — 사이트명, 소개 문구, 메뉴, 우리가 하는 일, 예시 콘텐츠, 문의 안내를 수정합니다. 모든 상단 메뉴는 페이지의 해당 섹션으로 이동합니다.
src/styles/global.css — 색상과 간격은 파일 상단 CSS 변수에서 조정합니다.
문의 섹션 — 실제 문의 이메일이나 문의 페이지 링크가 정해지면 연결합니다. 템플릿에는 동작하지 않는 예시 연락처를 넣지 않았습니다.
인사이트 카드는 시각 예시입니다. 실제 글이 준비되면 제목·설명·링크를 바꾸세요. 가짜 성과 수치나 후기는 포함하지 않습니다.

## 실행

의존성 설치: docker compose run --rm amade deps install
빌드: docker compose run --rm amade build {{site.id}}
미리보기: docker compose run --rm --service-ports amade site preview {{site.id}}
배포: docker compose run --rm amade deploy {{site.id}}
