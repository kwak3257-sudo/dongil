import { METHODS } from './methods';
import type { Capital, Method, Profile, RiskLevel, Skill } from './types';

const CAPITAL_LEVEL: Record<Capital, number> = { none: 0, small: 1, mid: 2, large: 3 };
const RISK_LEVEL: Record<RiskLevel, number> = { low: 0, mid: 1, high: 2 };

// 기술을 살릴 수 있는 방법
const SKILL_FIT: Record<string, Skill[]> = {
  freelance: ['design', 'video', 'dev', 'writing', 'language', 'excel', 'teaching'],
  'ai-service': ['writing', 'language', 'design', 'excel'],
  digital: ['teaching', 'writing', 'design', 'excel', 'dev'],
  shorts: ['video', 'teaching'],
  blog: ['writing'],
  store: ['sales', 'design'],
};

export interface RankedMethod {
  method: Method;
  score: number;
  reasons: string[];
}

export function scoreMethod(method: Method, profile: Profile): RankedMethod {
  let score = 100 - method.baseRank * 4;
  const reasons: string[] = [];

  if (CAPITAL_LEVEL[profile.capital] < CAPITAL_LEVEL[method.minCapital]) {
    score -= 40;
    reasons.push('시작 자금이 조금 필요해요');
  }

  if (profile.hoursPerWeek < method.minHours) {
    score -= 25;
    reasons.push(`주 ${method.minHours}시간 이상이 필요해요`);
  }

  const fit = SKILL_FIT[method.id] ?? [];
  const matched = fit.filter((s) => profile.skills.includes(s));
  if (method.needsSkill && profile.skills.length === 0) {
    score -= 30;
    reasons.push('팔 수 있는 기술이 있어야 해요');
  } else if (matched.length > 0) {
    score += 15;
    reasons.push('가진 기술을 바로 살릴 수 있어요');
  }

  if (RISK_LEVEL[method.risk] > RISK_LEVEL[profile.risk]) {
    score -= 20;
    reasons.push('원하는 것보다 위험도가 높아요');
  }

  if (method.id === 'tax') {
    if (profile.incomeType === 'salary' || profile.incomeType === 'business') {
      score += 10;
      reasons.push('소득이 있어 세액공제를 받을 수 있어요');
    } else {
      score -= 35;
      reasons.push('세액공제는 근로·사업소득이 있어야 받아요');
    }
  }

  // 목표가 크면 수익 상한이 높은 방법에 가산점
  if (profile.goalMonthly >= 1_000_000 && method.growth === 'high') {
    score += 10;
    reasons.push('목표 금액이 커서 성장성이 중요해요');
  }

  if (method.daysToFirst <= 14) {
    reasons.push('빠르게 첫 성과를 볼 수 있어요');
  }

  return { method, score, reasons };
}

export function rankMethods(profile: Profile): RankedMethod[] {
  return METHODS.map((m) => scoreMethod(m, profile)).sort(
    (a, b) => b.score - a.score || a.method.baseRank - b.method.baseRank,
  );
}

// 처음 시작할 모듈: 준비된 모듈 중 점수가 가장 높은 것
export function recommendStart(profile: Profile): string {
  const first = rankMethods(profile).find((r) => r.method.available);
  return first ? first.method.id : 'spending';
}
