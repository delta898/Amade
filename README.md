# Amade로 정적 사이트 시작하기

Amade는 Astro 기반 정적 사이트를 만들고, Cloudflare Workers Static Assets에 배포할 수 있게 돕는 CLI와 로컬 Homepage 템플릿 저장소입니다. 이 저장소를 일반 Git 저장소로 clone하면 Compose 설정, 문서, 사이트 템플릿을 함께 받습니다. CLI Docker image에는 사이트 템플릿이 포함되지 않으며, 실행 때 이 저장소의 `amade/templates/`를 읽기 전용으로 참조합니다.

> 현재 공개 시험판입니다. 기본 image는 `0.1.0-rc.5`이며, 명령·설정 형식은 정식 1.0 이전에 바뀔 수 있습니다.

## 시작하기

### 1. Amade 저장소 받기

```sh
git clone https://github.com/delta898/Amade.git
cd Amade
```

Amade 저장소의 `git pull`로 Compose 설정과 공식 템플릿을 업데이트할 수 있습니다. `amade/workspace/`는 이 upstream 저장소의 Git 추적에서 제외되어 사이트 코드·콘텐츠가 실수로 Amade 저장소에 섞이지 않습니다. 사용자 사이트 코드를 별도 Git으로 관리하려면 `amade/workspace/` 안에서 사용자가 직접 별도 저장소를 초기화하거나 clone하면 됩니다. Git 사용은 선택 사항입니다.

최초 한 번, 추적되지 않는 로컬 설정 파일을 준비합니다. `.env`가 아직 없을 때만 예제 파일을 복사하세요. 이미 `.env`가 있으면 다시 복사해 덮어쓰지 않습니다.

macOS/Linux:

```sh
test -f .env || cp .env.example .env
```

Windows PowerShell:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

경로를 바꿔야 하는 경우 `.env`만 수정합니다. `.env.example`은 Git에 올리는 공유 기본값이며, `.env`는 각 컴퓨터의 로컬 파일입니다.

### 2. 필수 도구 확인 및 첫 사이트 생성

Docker Engine과 Docker Compose v2, Git이 필요합니다. Docker Desktop에는 보통 Compose가 포함됩니다. 터미널에서 다음 명령이 동작하는지 확인하세요.

```sh
docker version
docker compose version
git --version
```

`.env`를 준비한 뒤 이 저장소 루트에서 실행합니다. 기본 경로는 보통 수정할 필요가 없습니다. 템플릿 디렉터리는 컨테이너에 읽기 전용으로 연결됩니다.

```sh
docker compose run --rm amade doctor
docker compose run --rm amade init
docker compose run --rm amade site list
```

`init`은 Project 설정을 준비하고 첫 Site/App을 추가하도록 안내합니다. 사이트 이름과 ID를 선택하면 `amade/workspace/apps/<site-id>/`에 Astro 시작 앱이 만들어집니다. JSON 파일을 직접 편집할 필요는 없습니다.

### 3. 기본 흐름: init, build, deploy

```sh
docker compose run --rm amade init
docker compose run --rm amade build my-site
docker compose run --rm amade deploy my-site
```

`build`는 Astro 의존성이 없을 때 설치 여부를 묻고, 동의하면 설치 후 빌드합니다. `deploy`는 최신 사이트를 빌드하고 Cloudflare 로그인을 확인합니다. 로그인이 필요하면 device login으로 브라우저 승인을 안내한 뒤 계정과 Worker 대상을 보여주고 최종 확인을 받습니다. 첫 배포는 `workers.dev` 주소에서 확인할 수 있습니다.

### 4. 로컬 미리보기

```sh
docker compose run --rm amade build my-site
docker compose run --rm --service-ports amade site preview my-site
```

`my-site`는 예시입니다. 실제 Site ID로 바꾸세요. Preview는 `http://localhost:4321`에서 확인하고 끝낼 때 터미널에서 `Ctrl+C`를 누릅니다. `amade/workspace/apps/<site-id>/dist/`는 빌드 산출물이므로 Git에 커밋하지 않습니다. 세부 작업에는 `deps install`, `site build`, `auth cloudflare login/status`, `site plan` 같은 unit command도 사용할 수 있습니다.

## 사용자 사이트 변경사항 저장하기 (선택)

Amade upstream Git은 Compose, 문서, 공식 템플릿 업데이트를 받는 용도입니다. `amade/workspace/`는 그 저장소에서 무시되므로, 사이트 코드와 콘텐츠를 Git으로 관리하려면 workspace 안에서 별도 저장소를 사용합니다. 예를 들어 사이트를 만든 뒤 다음처럼 초기화할 수 있습니다.

```sh
cd amade/workspace
git init
git add .
git commit -m "Create the first site"
```

원격 GitHub/GitLab 저장소 연결과 push는 사용자가 선택·관리합니다. Amade가 Git remote나 CI/CD를 만들지 않습니다. Cloudflare 자동 배포를 구성하지 않았다면 Git push만으로 사이트가 갱신되지는 않습니다. 먼저 개발·콘텐츠 작업을 진행한 뒤, 배포가 필요할 때 Amade의 Cloudflare 인증 및 배포 안내를 따르세요.

## 프로젝트 파일

- `compose.yaml`: Amade 공개 Docker image를 실행하는 단일 service Compose 설정.
- `.env.example`: Git 추적 대상인 비밀 없는 경로 설정 예제입니다. 새 환경에서 `.env`를 만들 때 복사합니다.
- `.env`: 각 컴퓨터의 로컬 설정 파일이며 Git에서 제외합니다. 필요한 경우 경로를 수정합니다. 인증 token/API key는 여기에 넣지 않습니다.
- `amade/config/amade.config.json.sample`: 비밀정보가 없는 시작 설정. `amade init`이 실제 설정을 생성합니다.
- `amade/templates/homepage/`: manifest와 Astro/CSS/README starter 파일. `site add`가 이를 복사하며, 기존 생성 앱은 이후 upstream 템플릿 업데이트로 바뀌지 않습니다.
- `amade/workspace/`: npm workspace root, Astro 앱, 콘텐츠와 build 결과를 둡니다. 상위 Amade Git 저장소에서 무시됩니다.
- `.gitignore`: dependency와 build 산출물을 Git에서 제외합니다.

인증 token과 API key를 저장소나 `.env`에 넣지 마세요. 인증 정보는 Docker named volume에 보관됩니다. 다만 Amade와 사이트 build 코드는 같은 container 사용자로 실행되므로 dependency lifecycle/build script도 인증 정보에 접근할 수 있습니다. 이 보안 절충은 초기 사용자 경로에서 수용하기로 했습니다. 신뢰할 수 있는 사이트 코드와 dependency만 사용하세요. Docker volume은 OS keychain처럼 자동 암호화되지 않습니다.

## Amade CLI 이미지 버전

이 저장소의 Compose 기본 Amade CLI 버전은 이 upstream 저장소에서 독립적으로 선택·검증합니다. 새 image가 GHCR에 게시되어도 pin은 자동 변경되지 않습니다. 현재 기본값은 legacy 인증 volume 호환을 포함하고 실제 deploy smoke test를 통과한 `0.1.0-rc.5`입니다. 사용자는 원하면 `compose.yaml` 맨 위 `x-amade-image` 값을 다른 게시된 버전으로 바꿀 수 있습니다.

```yaml
x-amade-image: &amade-image ${AMADE_IMAGE:-ghcr.io/delta898/amade:0.1.0-rc.5}
```

커밋하지 않고 일시적으로 다른 버전을 시험하려면 `.env`에서 `AMADE_IMAGE`를 지정할 수 있습니다. 이 값은 `compose.yaml`의 기본값보다 우선합니다.

```dotenv
AMADE_IMAGE=ghcr.io/delta898/amade:0.1.0-rc.5
```

Amade CLI의 source repository는 구현·유지보수용입니다. 일반 사용자는 이를 clone할 필요가 없습니다.
