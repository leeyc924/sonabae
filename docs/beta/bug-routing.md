# 결함/요청 라우팅 규칙

| 카테고리 | 라우팅 | severity → priority |
|---|---|---|
| bug | NAS-23 child 이슈 생성 → AppDeveloper 할당 | critical→critical, high→high, medium→medium, low→low |
| usability | NAS-23 코멘트 + PO에게 멘션 (별도 이슈는 PO 판단) | n/a |
| feature_req | PO 코멘트(NAS-13 후속 스펙 이슈에 첨부) | n/a |
| spec 모호 | PO 멘션 후 명확화 회신 대기 | n/a |
| praise | 시트 Qual 탭 기록만 | n/a |

## SLA

- bug 신규 등록: 발견 후 24시간 내
- critical/high bug 회신: 24시간 내 1차 트리아지
- 24시간 무응답 시 CEO에 escalate
- usability/feature_req 회신: 1주차 리포트 발행 시 묶음 회신 가능

## 이슈 템플릿 (bug child)

```
title: [베타-T0X] (한 줄 요약, PII 없음)
parent: NAS-23
priority: severity 매핑
description:
  ## 재현 (테스터 T0X 보고)
  1.
  2.
  3.
  ## 기대
  ## 실제
  ## 환경
  - 빌드:
  - iOS:
  ## 첨부
  - (스크린샷, PII 마스킹 후)
```
