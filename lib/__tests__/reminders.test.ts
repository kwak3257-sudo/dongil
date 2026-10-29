import { todayMission } from '../escort';
import { DEFAULT_REMINDERS, EVENING_DAYS, MORNING_DAYS, planReminders } from '../reminders';

const on = { ...DEFAULT_REMINDERS, enabled: true }; // 아침 8시, 저녁 9시
const mission = todayMission(['spending'], {});
// 로컬 시각 기준 2026-11-02 10:00 (아침 8시는 지났고 저녁 9시는 아직)
const now = new Date(2026, 10, 2, 10, 0, 0);
const iso = (d: Date) => d.toISOString();

describe('planReminders', () => {
  it('plans nothing when reminders are off', () => {
    expect(planReminders({ settings: DEFAULT_REMINDERS, mission, lastProgressAt: null, startedAt: iso(now), now })).toEqual([]);
  });

  it('skips times already past today and stays far under the iOS 64 limit', () => {
    const plan = planReminders({ settings: on, mission, lastProgressAt: iso(now), startedAt: iso(now), now });
    expect(plan.every((r) => r.date > now)).toBe(true);
    const mornings = plan.filter((r) => r.id.startsWith('morning'));
    const evenings = plan.filter((r) => r.id.startsWith('evening'));
    expect(mornings).toHaveLength(MORNING_DAYS - 1); // 오늘 아침 8시는 지남
    expect(mornings[0].date).toEqual(new Date(2026, 10, 3, 8, 0, 0));
    expect(evenings).toHaveLength(EVENING_DAYS - 1); // 오늘 이미 진행했으니 오늘 저녁은 쉼
    expect(plan.length).toBeLessThan(64);
    expect(new Set(plan.map((r) => r.id)).size).toBe(plan.length);
  });

  it('keeps tonight’s check-in when there was no progress today', () => {
    const yesterday = new Date(2026, 10, 1, 20, 0, 0);
    const plan = planReminders({ settings: on, mission, lastProgressAt: iso(yesterday), startedAt: iso(yesterday), now });
    expect(plan.find((r) => r.id === 'evening-0')?.date).toEqual(new Date(2026, 10, 2, 21, 0, 0));
  });

  it('changes the morning message as the user stays stuck, then away', () => {
    const plan = planReminders({ settings: on, mission, lastProgressAt: iso(now), startedAt: iso(now), now });
    const day = (n: number) => plan.find((r) => r.id === `morning-${n}`)!;
    expect(day(1).title).toContain('오늘의 미션'); // 1일째: 평소 미션
    expect(day(1).body).toContain(mission!.step.title);
    expect(day(3).title).toContain('코치가 먼저'); // 3일째: 막힘 → 더 작은 한 걸음
    expect(day(3).body).toContain('5분');
    expect(day(7).title).toContain('다시 시작'); // 7일째: 다시 시작
  });

  it('points to the map when every module is finished, with no evening check-in', () => {
    const plan = planReminders({ settings: on, mission: null, lastProgressAt: iso(now), startedAt: iso(now), now });
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.every((r) => r.id.startsWith('morning'))).toBe(true);
    expect(plan[0].body).toContain('돈길 지도');
  });

  it('uses the chosen hours', () => {
    const plan = planReminders({ settings: { ...on, morningHour: 12, eveningHour: 22 }, mission, lastProgressAt: null, startedAt: iso(now), now });
    expect(plan[0]).toMatchObject({ id: 'morning-0', date: new Date(2026, 10, 2, 12, 0, 0) });
    expect(plan.find((r) => r.id === 'evening-0')?.date).toEqual(new Date(2026, 10, 2, 22, 0, 0));
  });
});
