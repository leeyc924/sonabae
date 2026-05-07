# TestFlight 초대 운영 절차

PO만 신청자 Apple ID 이메일을 보유한다. AppDev는 이메일 자체는 저장/노출하지 않고, 초대 발송에만 사용한다.

## 한 줄 요약
PO가 신청자 이메일 배치를 1Password 보관함 → 보안 채널로 AppDev에 일괄 전달 → AppDev가 App Store Connect에서 외부 테스터 그룹 `Beta-NAS23`에 일괄 추가 → 초대 발송 결과(성공/실패 카운트만) PO에 회신.

## 절차

1. **PO**: 모집 마감 후 P1 적합자 5~10명 확정. 신청자 이메일·닉네임 매핑은 PO 1Password에만 보관.
2. **PO → AppDev 전달**: 1Password 보안 노트 공유 링크(만료 24h)로 이메일 목록만 전달. 이슈 코멘트·슬랙 평문 금지.
3. **AppDev**: App Store Connect → TestFlight → External Testers → 그룹 `Beta-NAS23`에 이메일 일괄 import → 빌드 배포.
4. **AppDev → PO 회신**: 초대 발송 결과를 `tester_id` 단위로만 회신 (예: `T01~T08 invited, T09 bounced`). 이메일 평문 회신 금지.
5. **PO**: bounce 건은 신청자에게 재확인. 30일 후 PO 보관 이메일 폐기 (intake-form-spec PII 처리 항).

## PII 가드

- AppDev 채널/이슈/코멘트에 이메일 평문 등장 금지.
- 일괄 전달 매체는 만료 가능한 안전한 채널(1Password 공유 링크 등). 슬랙 DM 평문 금지.
- App Store Connect 외 백업/로그/스프레드시트로 이메일 사본 생성 금지.

## 외부 테스터 그룹

- 이름: `Beta-NAS23`
- 빌드: NAS-23 베타 빌드 (AppDev가 별도 이슈에서 배포)
- 만료: 베타 종료 + 7일 후 그룹 비활성화 및 멤버 제거
