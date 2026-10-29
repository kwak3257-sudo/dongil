import { moduleFor } from './modules';
import type { Step } from './types';

const DAY = 24 * 60 * 60 * 1000;

export interface Mission {
  methodId: string;
  step: Step;
  index: number; // 모듈 안에서 몇 번째 단계인지 (0부터)
  total: number;
}

// 진행 중인 모듈들에서 아직 안 한 첫 단계를 오늘의 미션으로 고른다.
export function todayMission(activeModules: string[], completed: Record<string, string>): Mission | null {
  for (const methodId of activeModules) {
    const mod = moduleFor(methodId);
    if (!mod) continue;
    const index = mod.steps.findIndex((s) => !completed[s.id]);
    if (index >= 0) return { methodId, step: mod.steps[index], index, total: mod.steps.length };
  }
  return null;
}

export function daysSince(iso: string | null, now: Date = new Date()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / DAY));
}

export type EscortState = 'fresh' | 'onTrack' | 'stuck' | 'away';

// 3일 이상 멈추면 막힘, 7일 이상이면 다시 시작 플랜
export function escortState(lastProgressAt: string | null, startedAt: string | null, now: Date = new Date()): EscortState {
  const since = daysSince(lastProgressAt ?? startedAt, now);
  if (since === null) return 'fresh';
  if (since >= 7) return 'away';
  if (since >= 3) return 'stuck';
  return lastProgressAt ? 'onTrack' : 'fresh';
}

// 첫 수익 지도: 수익·절약을 기록하는 첫 단계까지의 진행
export function firstIncomeMap(methodId: string, completed: Record<string, string>) {
  const mod = moduleFor(methodId);
  if (!mod) return null;
  const goalIndex = mod.steps.findIndex((s) => s.proof);
  const goal = goalIndex >= 0 ? goalIndex : mod.steps.length - 1;
  const stepsToGoal = mod.steps.slice(0, goal + 1);
  const done = stepsToGoal.filter((s) => completed[s.id]).length;
  return {
    goalLabel: mod.goalLabel,
    done,
    total: stepsToGoal.length,
    reached: done === stepsToGoal.length,
    overallDone: mod.steps.filter((s) => completed[s.id]).length,
    overallTotal: mod.steps.length,
  };
}

// 막혔을 때 제안: 같은 단계를 더 작게 쪼갠 첫 행동
export function smallerStep(step: Step): string {
  const first = step.guide[0] ?? step.title;
  return `오늘은 딱 5분만: "${first}" 이것 하나만 해 보세요.`;
}
