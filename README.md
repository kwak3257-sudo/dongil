# 돈길 DONGIL — The Money Path

첫 수익까지 끝까지 함께 걷는 재테크 실행 앱. Expo(React Native) 하나로 iOS·Android·웹을 만듭니다.

## 지금 들어 있는 것 (MVP)

- **온보딩 6문항** → 자금·시간·기술·소득·목표·위험 성향으로 11가지 방법의 맞춤 순위 계산 (`lib/ranking.ts`)
- **모듈 1~3 체크리스트**: 새는 돈 막기, 세금 아끼기, 프리랜서 시작하기 (`lib/modules.ts`, 단계별 따라 하기 가이드 포함)
- **계산 도구**: 구독, 비상금, 연금저축·IRP 세액공제(2025년 귀속 기준), 프리랜서 실수령, 소개글 초안 (`lib/tools.ts`)
- **에스코트**: 오늘의 미션 1개, 3일 멈추면 코치가 먼저 말 걸기, 7일 쉬면 다시 시작 안내, 첫 수익 지도 (`lib/escort.ts`)
- **완료 인증**: 기록 탭에 번 돈·아낀 돈을 남기면, 지금 차례인 '기록 단계'가 자동 완료
- **AI 코치**: 서버가 없으면 기기 안의 기본 코치, `EXPO_PUBLIC_AI_ENDPOINT`를 넣으면 Claude 코치 (`lib/ai.ts`, `supabase/functions/coach`)
- 데이터는 기기에 저장(AsyncStorage). 로그인·서버 저장은 다음 단계.

## 실행

```bash
npm install
npx expo start          # 휴대폰 Expo Go로 QR 스캔, 또는 w 키로 웹
npm test                # 단위 테스트
npm run typecheck && npx expo lint
```

## AI 코치 켜기

1. Supabase 프로젝트를 만들고 `supabase functions deploy coach`
2. `supabase secrets set ANTHROPIC_API_KEY=...` (모델 변경은 `ANTHROPIC_MODEL`)
3. 앱 루트에 `.env` 파일: `EXPO_PUBLIC_AI_ENDPOINT=https://<프로젝트>.supabase.co/functions/v1/coach`

출시 전에는 함수에 로그인 검증과 사용자별 호출 횟수 제한을 꼭 추가하세요. 지금은 주소를 아는 누구나 호출할 수 있습니다.

## 다음 단계 (기획서 2단계)

- 구독 결제(RevenueCat), 7일 무료 체험
- Supabase 로그인 + 기록 서버 저장
- 푸시 알림(오늘의 미션, 저녁 체크인)
- 모듈 4·5 체크리스트 추가: `lib/modules.ts`에 템플릿을 넣고 `lib/methods.ts`에서 `available: true`

## 출시

```bash
npx eas-cli@latest build -p all
npx eas-cli@latest submit
```

애플 개발자 계정과 구글 플레이 개발자 계정이 필요합니다.
