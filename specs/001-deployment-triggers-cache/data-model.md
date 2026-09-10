# Data Model: 배포 트리거 및 원격 캐시 개선

이 기능은 애플리케이션 데이터를 저장하지 않고 GitHub Actions 입력·출력과 Vercel 설정을 다룹니다. 아래 모델은 workflow 간 계약과 검증 대상을 정의하기 위한 논리 모델입니다.

## 배포 대상

| 필드          | 타입   | 설명                        | 제약                                |
| ------------- | ------ | --------------------------- | ----------------------------------- |
| `app`         | enum   | `web` 또는 `admin`          | 허용된 matrix 항목만 사용           |
| `environment` | enum   | `preview` 또는 `production` | 수동 실행 입력에서 검증             |
| `project_id`  | string | Vercel 프로젝트 식별자      | GitHub Actions Variable에서 주입    |
| `git_ref`     | string | 빌드할 commit 또는 branch   | Production은 `main`의 검증된 commit |

## 영향 범위 판정

| 필드                        | 타입    | 설명                     | 제약                                                                 |
| --------------------------- | ------- | ------------------------ | -------------------------------------------------------------------- |
| `base`                      | Git ref | 비교 시작점              | 최초 push에서는 없을 수 있음                                         |
| `head`                      | Git ref | 비교 끝점                | 검증된 workflow commit과 일치해야 함                                 |
| `turbo_affected`            | boolean | 앱 build task 영향 여부  | Turbo 그래프 결과                                                    |
| `deployment_config_changed` | boolean | 배포 직접 설정 변경 여부 | 명시된 path 목록만 대상                                              |
| `affected`                  | boolean | 최종 배포 실행 여부      | `deployment_config_changed` 또는 `turbo_affected` 중 하나라도 `true` |

## 수동 배포 요청

| 필드          | 타입          | 설명                    | 제약                         |
| ------------- | ------------- | ----------------------- | ---------------------------- |
| `app`         | enum          | `web`, `admin`, `all`   | `all`은 두 앱 실행           |
| `environment` | enum          | `preview`, `production` | 허용된 환경만 실행           |
| `ref`         | Git ref       | 수동 실행 대상 ref      | Production은 `main`으로 고정 |
| `actor`       | GitHub 사용자 | 실행 요청자             | 저장소 Actions 권한 필요     |

Production 수동 배포는 `production` Environment의 배포 브랜치 정책(`main`)을 통과해야 합니다.
1인 운영에서는 Required reviewer를 설정하지 않아 자기 승인 대기로 workflow가 멈추지 않도록 합니다.

## 원격 캐시 자격 증명

| 필드          | 타입          | 설명                | 저장 위치                             |
| ------------- | ------------- | ------------------- | ------------------------------------- |
| `TURBO_TOKEN` | secret string | Vercel Access Token | GitHub Secret `VERCEL_TOKEN`에서 주입 |
| `TURBO_TEAM`  | string        | Vercel 팀 slug      | workflow env의 `yapp-plus` literal    |

토큰의 원문은 workflow 입력·출력·실행 요약·캐시 artifact에 기록하지 않습니다.

## 배포 실행 기록

| 필드             | 타입    | 설명                             |
| ---------------- | ------- | -------------------------------- |
| `app`            | enum    | 배포 대상 앱                     |
| `environment`    | enum    | Preview 또는 Production          |
| `commit`         | SHA     | 빌드·배포에 사용한 검증된 commit |
| `outcome`        | enum    | `success`, `skipped`, `failure`  |
| `deployment_url` | URL?    | 성공 시 생성된 Vercel URL        |
| `failure_reason` | string? | 실패 시 요약 가능한 원인         |

실행 기록은 GitHub Actions 요약과 로그에만 남기며 별도 애플리케이션 DB에는 저장하지 않습니다.
