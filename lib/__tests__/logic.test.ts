import { escortState, firstIncomeMap, smallerStep, todayMission } from '../escort';
import { METHODS } from '../methods';
import { MODULES } from '../modules';
import { rankMethods, recommendStart } from '../ranking';
import { monthlyTotals } from '../records';
import { emergencyFund, freelanceNet, pensionTaxCredit, subscriptionTotals } from '../tools';
import type { Profile } from '../types';

const base: Profile = { capital: 'none', hoursPerWeek: 3, skills: [], incomeType: 'student', goalMonthly: 300000, risk: 'low' };

describe('methods & modules data', () => {
  it('has 11 methods with unique ids and ranks 1..11', () => {
    expect(METHODS).toHaveLength(11);
    expect(new Set(METHODS.map((m) => m.id)).size).toBe(11);
    expect(METHODS.map((m) => m.baseRank).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('every available method has a module, and step ids are unique across modules', () => {
    for (const m of METHODS.filter((x) => x.available)) expect(MODULES[m.id]).toBeDefined();
    const ids = Object.values(MODULES).flatMap((mod) => mod.steps.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every module has at least one proof step and guides on every step', () => {
    for (const mod of Object.values(MODULES)) {
      expect(mod.steps.some((s) => s.proof)).toBe(true);
      for (const s of mod.steps) expect(s.guide.length).toBeGreaterThan(0);
    }
  });
});

describe('ranking', () => {
  it('beginner with no money, skills or income starts with 새는 돈 막기', () => {
    expect(recommendStart(base)).toBe('spending');
    const ranked = rankMethods(base);
    const tax = ranked.findIndex((r) => r.method.id === 'tax');
    const freelance = ranked.findIndex((r) => r.method.id === 'freelance');
    expect(tax).toBeGreaterThan(2); // 소득 없음 → 세금 모듈 뒤로
    expect(freelance).toBeGreaterThan(2); // 기술 없음 → 프리랜서 뒤로
  });
  it('salaried designer gets freelance and tax near the top', () => {
    const p: Profile = { ...base, capital: 'small', hoursPerWeek: 15, skills: ['design'], incomeType: 'salary' };
    const top3 = rankMethods(p).slice(0, 3).map((r) => r.method.id);
    expect(top3).toEqual(expect.arrayContaining(['freelance', 'tax']));
  });
  it('low risk tolerance pushes mid-risk methods down', () => {
    const low = rankMethods(base).find((r) => r.method.id === 'etf')!;
    const high = rankMethods({ ...base, risk: 'high', capital: 'small' }).find((r) => r.method.id === 'etf')!;
    expect(high.score).toBeGreaterThan(low.score);
  });
});

describe('escort', () => {
  it('today mission is the first incomplete step of the first active module', () => {
    expect(todayMission(['spending'], {})?.step.id).toBe('sp-1');
    expect(todayMission(['spending'], { 'sp-1': 'x' })?.step.id).toBe('sp-2');
    const allSpending = Object.fromEntries(MODULES.spending.steps.map((s) => [s.id, 'x']));
    expect(todayMission(['spending', 'tax'], allSpending)?.methodId).toBe('tax');
    expect(todayMission([], {})).toBeNull();
    expect(todayMission(['unknown'], {})).toBeNull();
  });
  it('escort state follows days since progress', () => {
    const now = new Date('2026-10-28T12:00:00Z');
    expect(escortState(null, null, now)).toBe('fresh');
    expect(escortState(null, '2026-10-28T08:00:00Z', now)).toBe('fresh');
    expect(escortState('2026-10-27T12:00:00Z', null, now)).toBe('onTrack');
    expect(escortState('2026-10-25T11:00:00Z', null, now)).toBe('stuck');
    expect(escortState(null, '2026-10-20T12:00:00Z', now)).toBe('away');
  });
  it('first income map counts steps up to the first proof step', () => {
    const map = firstIncomeMap('spending', { 'sp-1': 'x' })!;
    expect(map.total).toBe(3); // sp-1..sp-3 (sp-3 이 첫 절약 기록)
    expect(map.done).toBe(1);
    expect(map.reached).toBe(false);
    expect(firstIncomeMap('nope', {})).toBeNull();
  });
  it('smaller step quotes the first guide line', () => {
    expect(smallerStep(MODULES.spending.steps[0])).toContain('카드사 앱');
  });
});

describe('tools', () => {
  it('subscription totals', () => {
    const t = subscriptionTotals([{ name: 'a', monthly: 10000 }, { name: 'b', monthly: 5000, unused: true }, { name: 'c', monthly: -3 }]);
    expect(t).toEqual({ monthly: 15000, yearly: 180000, unusedMonthly: 5000, unusedYearly: 60000 });
  });
  it('emergency fund', () => {
    expect(emergencyFund(2_000_000, 3, 1_000_000, 500_000)).toEqual({ target: 6_000_000, remaining: 5_000_000, monthsToReach: 10 });
    expect(emergencyFund(1_000_000, 3, 5_000_000, 0).monthsToReach).toBe(0);
    expect(emergencyFund(1_000_000, 3, 0, 0).monthsToReach).toBeNull();
  });
  it('pension tax credit applies limits and rate by salary', () => {
    expect(pensionTaxCredit(40_000_000, 6_000_000, 3_000_000)).toEqual({ eligible: 9_000_000, rate: 0.165, credit: 1_485_000 });
    expect(pensionTaxCredit(80_000_000, 8_000_000, 0)).toEqual({ eligible: 6_000_000, rate: 0.132, credit: 792_000 });
    expect(pensionTaxCredit(55_000_000, 1_000_000, 0).rate).toBe(0.165);
  });
  it('freelance net subtracts fee and 3.3% withholding', () => {
    expect(freelanceNet(100_000, 0.2, 4)).toEqual({ fee: 20_000, withholding: 2_640, net: 77_360, hourly: 19_340 });
    expect(freelanceNet(100_000, 0.2, 0).hourly).toBeNull();
  });
});

describe('records', () => {
  it('monthly totals only count this month', () => {
    const now = new Date(2026, 9, 28);
    const r = monthlyTotals(
      [
        { id: '1', date: new Date(2026, 9, 2).toISOString(), kind: 'saved', amount: 10000 },
        { id: '2', date: new Date(2026, 9, 20).toISOString(), kind: 'earned', amount: 50000 },
        { id: '3', date: new Date(2026, 8, 30).toISOString(), kind: 'earned', amount: 99999 },
      ],
      now,
    );
    expect(r).toEqual({ earned: 50000, saved: 10000, total: 60000, allTime: 159999 });
  });
});
