// 계산 도구. 금액은 모두 원 단위.

export interface Subscription {
  name: string;
  monthly: number;
  unused?: boolean;
}

export function subscriptionTotals(items: Subscription[]) {
  const monthly = items.reduce((s, i) => s + Math.max(0, i.monthly || 0), 0);
  const unusedMonthly = items
    .filter((i) => i.unused)
    .reduce((s, i) => s + Math.max(0, i.monthly || 0), 0);
  return { monthly, yearly: monthly * 12, unusedMonthly, unusedYearly: unusedMonthly * 12 };
}

export function emergencyFund(monthlyExpense: number, months: number, current: number, monthlySaving: number) {
  const target = Math.max(0, monthlyExpense) * Math.max(0, months);
  const remaining = Math.max(0, target - Math.max(0, current));
  const monthsToReach = remaining === 0 ? 0 : monthlySaving > 0 ? Math.ceil(remaining / monthlySaving) : null;
  return { target, remaining, monthsToReach };
}

// 연금저축·IRP 세액공제 (2025년 귀속 기준, 매년 확인 필요)
export const TAX_RULE = {
  year: 2025,
  pensionLimit: 6_000_000, // 연금저축 단독 한도
  totalLimit: 9_000_000, // 연금저축 + IRP 합산 한도
  salaryThreshold: 55_000_000, // 총급여 기준 (종합소득 4,500만 원)
  highRate: 0.165,
  lowRate: 0.132,
};

export function pensionTaxCredit(totalSalary: number, pensionSaving: number, irp: number) {
  const pension = Math.min(Math.max(0, pensionSaving), TAX_RULE.pensionLimit);
  const eligible = Math.min(pension + Math.max(0, irp), TAX_RULE.totalLimit);
  const rate = totalSalary <= TAX_RULE.salaryThreshold ? TAX_RULE.highRate : TAX_RULE.lowRate;
  return { eligible, rate, credit: Math.floor(eligible * rate) };
}

// 프리랜서 실수령액: 플랫폼 수수료 + 원천징수 3.3%
export function freelanceNet(price: number, feeRate: number, hours: number) {
  const p = Math.max(0, price);
  const fee = Math.round(p * Math.min(Math.max(feeRate, 0), 1));
  const withholding = Math.round((p - fee) * 0.033);
  const net = p - fee - withholding;
  const hourly = hours > 0 ? Math.round(net / hours) : null;
  return { fee, withholding, net, hourly };
}

// 소개글 초안 (AI 서버가 없을 때 쓰는 기본 템플릿)
export function listingDraft(skill: string, experience: string, deliverable: string) {
  const s = skill.trim() || '작업';
  const e = experience.trim();
  const d = deliverable.trim() || '결과물';
  return [
    `[${s}] 처음 맡기셔도 편하게, 꼼꼼하게 작업해 드립니다`,
    '',
    '안녕하세요.' + (e ? ` ${e} 경험을 바탕으로` : '') + ` ${s} 작업을 도와드립니다.`,
    '',
    '■ 이런 분께 추천해요',
    `- ${s}이(가) 필요하지만 어디서부터 시작할지 막막한 분`,
    '- 빠르고 소통이 잘 되는 작업자를 찾는 분',
    '',
    '■ 작업 범위',
    `- ${d} 제공`,
    '- 수정 2회 포함 (추가 수정은 협의)',
    '',
    '■ 진행 순서',
    '1. 요청 사항 확인  2. 초안 전달  3. 수정  4. 최종 납품',
  ].join('\n');
}

export const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
