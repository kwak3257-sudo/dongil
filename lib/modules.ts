import type { ModuleTemplate, Phase } from './types';

export const PHASE_LABEL: Record<Phase, string> = {
  week1: '첫 주',
  day30: '첫 30일',
  day90: '30~90일',
};

export const MODULES: Record<string, ModuleTemplate> = {
  spending: {
    methodId: 'spending',
    goalLabel: '첫 절약',
    steps: [
      {
        id: 'sp-1', phase: 'week1', title: '최근 3개월 카드·계좌 내역 열기', minutes: 15,
        guide: ['카드사 앱 또는 은행 앱을 엽니다.', '이용내역에서 기간을 최근 3개월로 설정합니다.', '매달 반복되는 결제에 표시해 둡니다.'],
        tip: '여러 카드를 쓰면 카드사별로 한 번씩 확인하세요.',
      },
      {
        id: 'sp-2', phase: 'week1', title: '정기결제·구독 목록 적기', minutes: 20, tool: 'subscriptions',
        guide: ['반복 결제를 아래 구독 계산기에 하나씩 입력합니다.', '최근 한 달 동안 안 쓴 것에 표시합니다.', '1년 합계를 확인합니다.'],
      },
      {
        id: 'sp-3', phase: 'week1', title: '안 쓰는 구독 1개 이상 해지하기', minutes: 15, proof: 'saved',
        guide: ['구독 목록에서 가장 덜 쓰는 것 하나를 고릅니다.', '해당 서비스의 설정 > 구독 관리에서 해지합니다.', '아낀 월 금액을 기록에 남깁니다.'],
        tip: '해지가 어렵게 숨겨진 서비스는 앱스토어·구글플레이의 구독 메뉴에서 바로 해지할 수 있어요.',
      },
      {
        id: 'sp-4', phase: 'week1', title: '통신 요금제 점검하기', minutes: 30,
        guide: ['통신사 앱에서 지난 3개월 데이터 사용량을 확인합니다.', '사용량에 맞는 요금제나 알뜰폰 요금제와 비교합니다.', '바꾸면 아끼는 월 금액을 적어 둡니다.'],
      },
      {
        id: 'sp-5', phase: 'day30', title: '보험 중복 보장 확인하기', minutes: 30,
        guide: ['내보험다보여 같은 조회 서비스로 가입 보험을 한눈에 봅니다.', '같은 보장이 겹치는 상품이 있는지 확인합니다.', '해지는 손해가 생길 수 있으니 설계사나 보험사에 먼저 문의합니다.'],
        tip: '보험은 해지 환급금 손실이 있을 수 있어 신중하게 결정하세요.',
      },
      {
        id: 'sp-6', phase: 'day30', title: '파킹통장 또는 CMA 만들기', minutes: 20,
        guide: ['금리 비교 서비스에서 수시 입출금 상품을 비교합니다.', '조건(한도, 우대 조건)이 단순한 상품을 고릅니다.', '모바일로 계좌를 개설합니다.'],
      },
      {
        id: 'sp-7', phase: 'day30', title: '비상금 목표 정하고 자동이체 설정', minutes: 15, tool: 'emergency',
        guide: ['비상금 계산기로 목표 금액을 정합니다.', '월급날 다음 날로 파킹통장 자동이체를 겁니다.'],
      },
      {
        id: 'sp-8', phase: 'day90', title: '3개월 지출 다시 점검하고 아낀 금액 기록', minutes: 20, proof: 'saved',
        guide: ['첫 주와 같은 방법으로 최근 지출을 확인합니다.', '전보다 줄어든 월 금액을 계산합니다.', '기록 탭에 아낀 금액을 남깁니다.'],
      },
    ],
  },
  tax: {
    methodId: 'tax',
    goalLabel: '첫 세금 환급 준비',
    steps: [
      {
        id: 'tx-1', phase: 'week1', title: '내 총급여(연봉) 확인하기', minutes: 10,
        guide: ['홈택스 또는 회사 급여명세서에서 작년 총급여를 확인합니다.', '사업자라면 종합소득금액을 확인합니다.'],
      },
      {
        id: 'tx-2', phase: 'week1', title: '연금저축·IRP·ISA 차이 이해하기', minutes: 15,
        guide: ['연금저축·IRP: 낸 돈의 일부를 연말정산에서 세액공제로 돌려받습니다. 55세 전에 빼면 혜택을 토해낼 수 있습니다.', 'ISA: 계좌 안에서 생긴 투자 수익에 비과세·분리과세 혜택이 있습니다.', '오래 묶어도 되는 돈은 연금 계좌, 몇 년 안에 쓸 돈은 ISA가 맞습니다.'],
      },
      {
        id: 'tx-3', phase: 'week1', title: '예상 세액공제 금액 계산하기', minutes: 10, tool: 'taxCredit',
        guide: ['세액공제 계산기에 총급여와 연간 납입 예정액을 넣습니다.', '돌려받을 금액을 확인합니다.'],
      },
      {
        id: 'tx-4', phase: 'day30', title: '증권사 고르고 연금저축 계좌 개설', minutes: 20,
        guide: ['수수료와 앱 사용성을 기준으로 증권사를 고릅니다.', '비대면으로 연금저축 계좌를 개설합니다.'],
      },
      {
        id: 'tx-5', phase: 'day30', title: '월 자동이체 금액 정하기', minutes: 10,
        guide: ['비상금을 먼저 확보했는지 확인합니다.', '무리 없는 금액으로 월 자동이체를 겁니다.'],
        tip: '연말에 한꺼번에 넣어도 공제는 받지만, 매달 나눠 넣는 편이 부담이 적어요.',
      },
      {
        id: 'tx-6', phase: 'day30', title: '(선택) ISA 계좌 개설하기', minutes: 20,
        guide: ['몇 년 안에 쓸 투자금이 있다면 ISA를 개설합니다.', '가입 조건(소득 요건 등)을 증권사 앱에서 확인합니다.'],
      },
      {
        id: 'tx-7', phase: 'day90', title: '납입액 점검하고 연말 추가 납입 계획', minutes: 15, proof: 'saved',
        guide: ['올해 누적 납입액을 확인합니다.', '공제 한도까지 남은 금액과 여유 자금을 비교합니다.', '예상 환급액을 기록 탭에 아낀 돈으로 남깁니다.'],
      },
    ],
  },
  freelance: {
    methodId: 'freelance',
    goalLabel: '첫 의뢰 수익',
    steps: [
      {
        id: 'fr-1', phase: 'week1', title: '팔 수 있는 기술 1개 고르기', minutes: 15,
        guide: ['내 정보의 기술 목록에서 가장 자신 있는 것 하나를 고릅니다.', '"누가 이걸 돈 주고 맡길까?"를 한 문장으로 적습니다.'],
      },
      {
        id: 'fr-2', phase: 'week1', title: '크몽·숨고에서 경쟁 상품 3개 분석', minutes: 30,
        guide: ['고른 기술로 검색해 리뷰가 많은 상품 3개를 엽니다.', '가격, 작업 기간, 소개글 구성을 메모합니다.', '내가 더 잘할 수 있는 점 하나를 적습니다.'],
      },
      {
        id: 'fr-3', phase: 'week1', title: '포트폴리오 샘플 1개 만들기', minutes: 60,
        guide: ['실제 의뢰처럼 가상의 주제로 결과물 하나를 만듭니다.', '이미지나 PDF로 저장합니다.'],
      },
      {
        id: 'fr-4', phase: 'day30', title: '샘플 3개까지 늘리기', minutes: 120,
        guide: ['서로 다른 스타일이나 주제로 2개를 더 만듭니다.'],
      },
      {
        id: 'fr-5', phase: 'day30', title: '상품 소개글 쓰기', minutes: 30, tool: 'listing',
        guide: ['소개글 생성기로 초안을 만듭니다.', '내 말투로 고치고, 작업 범위와 수정 횟수를 분명히 적습니다.'],
      },
      {
        id: 'fr-6', phase: 'day30', title: '가격 정하기', minutes: 15, tool: 'quote',
        guide: ['견적 계산기로 수수료와 세금을 뺀 실수령액을 확인합니다.', '처음에는 리뷰를 모으기 위해 경쟁 상품보다 조금 낮게 시작합니다.'],
      },
      {
        id: 'fr-7', phase: 'day30', title: '플랫폼에 상품 등록하기', minutes: 40,
        guide: ['판매자 가입과 본인인증을 합니다.', '소개글, 샘플, 가격 패키지를 올립니다.'],
      },
      {
        id: 'fr-8', phase: 'day90', title: '첫 의뢰 완료하고 수익 기록', minutes: 60, proof: 'earned',
        guide: ['문의에는 24시간 안에 답합니다.', '약속한 기한보다 하루 일찍 납품합니다.', '정산 받은 금액을 기록 탭에 남깁니다.'],
      },
      {
        id: 'fr-9', phase: 'day90', title: '리뷰 5개 모으기', minutes: 30,
        guide: ['납품 후 리뷰를 정중하게 요청합니다.', '받은 피드백을 소개글에 반영합니다.'],
      },
      {
        id: 'fr-10', phase: 'day90', title: '가격 올리기 검토', minutes: 15,
        guide: ['리뷰가 5개 이상이면 가격을 10~20% 올려 봅니다.', '문의가 크게 줄면 다시 조정합니다.'],
      },
    ],
  },
};

export const moduleFor = (methodId: string): ModuleTemplate | undefined => MODULES[methodId];
