# Amade로 정적 사이트 시작하기

Amade는 Astro 기반 정적 사이트를 만들고, Cloudflare Workers Static Assets에 배포할 수 있게 돕는 CLI입니다. 이 저장소는 Amade 구현 코드가 아니라, **사용자 본인의 사이트 프로젝트 저장소를 시작하기 위한 GitHub Template**입니다.

> 현재 공개 시험판입니다. 기본 image는 `0.1.0-rc.5`이며, 명령·설정 형식은 정식 1.0 이전에 바뀔 수 있습니다.

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

## 변경사항 저장하기

사이트 코드와 Markdown 콘텐츠는 이 **사용자 저장소**에서 관리합니다.

```sh
git add .
git commit -m "Create the first site"
git push
```

이 단계의 `git push`는 사용자 GitHub 저장소에 변경사항을 저장합니다. Cloudflare에 자동 배포를 연결하기 전에는 push만으로 공개 사이트가 갱신되지는 않습니다. 먼저 개발·콘텐츠 작업을 진행한 뒤, 배포가 필요할 때 Amade의 Cloudflare 인증 및 배포 안내를 따르세요. Workers Builds 자동 배포는 별도의 연결·승인 절차를 완료한 경우에만 동작합니다.

## 프로젝트 파일

- `compose.yaml`: Amade 공개 Docker image를 실행하는 단일 service Compose 설정.
- `.env`: 비밀값이 아닌 Amade host/container 경로 기본값입니다. Git으로 관리합니다.
- `amade/config/amade.config.json.sample`: 비밀정보가 없는 시작 설정. `amade init`이 실제 설정을 생성합니다.
- `amade/workspace/`: npm workspace root, Astro 앱, 콘텐츠와 build 결과를 둡니다.
- `.gitignore`: dependency와 build 산출물을 Git에서 제외합니다.

인증 token과 API key를 저장소나 `.env`에 넣지 마세요. 인증 정보는 Docker named volume에 보관됩니다. 다만 Amade와 사이트 build 코드는 같은 container 사용자로 실행되므로 dependency lifecycle/build script도 인증 정보에 접근할 수 있습니다. 이 보안 절충은 초기 사용자 경로에서 수용하기로 했습니다. 신뢰할 수 있는 사이트 코드와 dependency만 사용하세요. Docker volume은 OS keychain처럼 자동 암호화되지 않습니다.

## Amade CLI 이미지 버전

템플릿의 기본 Amade CLI 버전은 이 템플릿 저장소에서 독립적으로 선택·검증합니다. 새 image가 GHCR에 게시되어도 pin은 자동 변경되지 않습니다. 현재 이 Template의 기본값은 legacy 인증 volume 호환을 포함하고 실제 deploy smoke test를 통과한 `0.1.0-rc.5`입니다. 사용자는 원하면 `compose.yaml` 맨 위 `x-amade-image` 값을 다른 게시된 버전으로 바꿀 수 있습니다.

```yaml
x-amade-image: &amade-image ${AMADE_IMAGE:-ghcr.io/delta898/amade:0.1.0-rc.5}
```

커밋하지 않고 일시적으로 다른 버전을 시험하려면 `.env`에서 `AMADE_IMAGE`를 지정할 수 있습니다. 이 값은 `compose.yaml`의 기본값보다 우선합니다.

```dotenv
AMADE_IMAGE=ghcr.io/delta898/amade:0.1.0-rc.5
```

Amade CLI의 source repository는 구현·유지보수용입니다. 일반 사용자는 이를 clone할 필요가 없습니다.
