# Amade로 정적 사이트 시작하기

Amade는 Astro 기반 정적 사이트를 만들고, Cloudflare Workers Static Assets에 배포할 수 있게 돕는 CLI입니다. 이 저장소는 Amade 구현 코드가 아니라, **사용자 본인의 사이트 프로젝트 저장소를 시작하기 위한 GitHub Template**입니다.

> 현재 공개 시험판입니다. 기본 image는 `0.1.0-rc.2`이며, 명령·설정 형식은 정식 1.0 이전에 바뀔 수 있습니다.

## 시작하기

### 1. 내 저장소 만들기

1. [Amade 공식 Template](https://github.com/delta898/Amade)을 엽니다.
2. **Use this template → Create a new repository**를 선택합니다.
3. 새 저장소의 소유자와 이름을 정합니다. 개인 프로젝트라면 **Private**를 권장합니다. 저장소 공개 범위는 사용자가 선택하며 Amade가 강제하지 않습니다.
4. 생성한 저장소를 clone하고 그 폴더로 이동합니다.

아래 예시의 `YOUR_ACCOUNT`와 `YOUR_REPOSITORY`를 방금 만든 저장소에 맞게 바꿉니다.

```sh
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

GitHub Template으로 새 저장소를 만들면 사용자는 처음부터 자기 저장소를 `origin`으로 갖습니다. Amade 구현 저장소를 fork하거나 그 저장소에 push할 필요가 없습니다.

### 2. 필수 도구 확인 및 첫 사이트 생성

Docker Engine과 Docker Compose v2, Git이 필요합니다. Docker Desktop에는 보통 Compose가 포함됩니다. 터미널에서 다음 명령이 동작하는지 확인하세요.

```sh
docker version
docker compose version
git --version
```

그다음 이 저장소 루트에서 실행합니다.

```sh
docker compose run --rm amade doctor
docker compose run --rm amade init
docker compose run --rm amade site list
```

`init`은 Project 설정을 준비하고 첫 Site/App을 추가하도록 안내합니다. 사이트 이름과 ID를 선택하면 `apps/<site-id>/`에 Astro 시작 앱이 만들어집니다. JSON 파일을 직접 편집할 필요는 없습니다.

### 3. 빌드하고 브라우저에서 미리보기

```sh
docker compose run --rm amade deps install
docker compose run --rm amade site build my-site
docker compose run --rm --service-ports amade site preview my-site
```

`my-site`는 예시입니다. `site list`에 나온 실제 Site ID로 바꾸세요. Preview 중에는 `http://localhost:4321`을 열어 확인하고, 끝낼 때 터미널에서 `Ctrl+C`를 누릅니다. `apps/<site-id>/dist/`는 빌드 산출물이므로 Git에 커밋하지 않습니다.

## 변경사항 저장하기

사이트 코드와 Markdown 콘텐츠는 이 **사용자 저장소**에서 관리합니다.

```sh
git add .
git commit -m "Create the first site"
git push
```

이 단계의 `git push`는 사용자 GitHub 저장소에 변경사항을 저장합니다. Cloudflare에 자동 배포를 연결하기 전에는 push만으로 공개 사이트가 갱신되지는 않습니다. 먼저 개발·콘텐츠 작업을 진행한 뒤, 배포가 필요할 때 Amade의 Cloudflare 인증 및 배포 안내를 따르세요. Workers Builds 자동 배포는 별도의 연결·승인 절차를 완료한 경우에만 동작합니다.

## 프로젝트 파일

- `compose.yaml`: Amade 공개 Docker image를 실행하는 Compose 설정. 템플릿에는 고정 `name`이 없으므로 Compose가 이 프로젝트 폴더 이름으로 프로젝트와 인증 volume을 분리합니다.
- `amade.config.json.sample`: 비밀정보가 없는 시작 설정. `amade init`이 실제 `amade.config.json`을 생성합니다.
- `.gitignore`: dependency, build 산출물, 로컬 환경 설정을 Git에서 제외합니다.
- `apps/`: `amade init`이 사이트를 생성하는 위치입니다.

인증 토큰, API key, `.env` 비밀값을 저장소에 넣지 마세요. `amade-auth` 서비스가 사용하는 Docker named volume은 Git 파일과 별도로 유지됩니다. Docker volume은 Docker host 접근 권한으로 보호되며 OS keychain처럼 자동 암호화되는 저장소는 아닙니다.

## Amade CLI 이미지 버전

템플릿의 기본 Amade CLI 버전은 이 템플릿 저장소에서 독립적으로 선택·검증합니다. 새 이미지가 GHCR에 게시되어도 템플릿의 기본 버전은 자동으로 바뀌지 않습니다. 기본 버전을 바꾸고 싶다면 사용자 저장소의 `compose.yaml` 맨 위 `x-amade-image` 값을 원하는 **게시·검증된 버전**으로 수정하세요. 두 서비스(`amade`, `amade-auth`)는 이 값을 함께 사용합니다.

```yaml
x-amade-image: &amade-image ${AMADE_IMAGE:-ghcr.io/delta898/amade:0.1.0-rc.2}
```

커밋하지 않고 일시적으로 다른 버전을 시험하려면 `.env`에서 `AMADE_IMAGE`를 지정할 수 있습니다. 이 값은 `compose.yaml`의 기본값보다 우선합니다.

```dotenv
AMADE_IMAGE=ghcr.io/delta898/amade:0.1.0-rc.2
```

Amade CLI의 source repository는 구현·유지보수용입니다. 일반 사용자는 이를 clone할 필요가 없습니다.
