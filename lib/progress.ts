import { METHODS } from './methods';
import { moduleFor } from './modules';
import { rankMethods } from './ranking';
import type { MoneyRecord, Profile, Step } from './types';

// 단계는 순서대로만 연다. 기록 단계는 실제 기록이 있어야 완료된다.
export type StepStatus = 'done' | 'current' | 'locked';

export function stepStatuses(methodId: string, completed: Record<string, string>): Record<string, StepStatus> {
  const mod = moduleFor(methodId);
  const out: Record<string, StepStatus> = {};
  if (!mod) return out;
  let currentGiven = false;
  for (const s of mod.steps) {
    if (completed[s.id]) out[s.id] = 'done';
    else if (!currentGiven) {
      out[s.id] = 'current';
      currentGiven = true;
    } else out[s.id] = 'locked';
  }
  return out;
}

// 되돌리기는 가장 최근에 끝낸 단계 하나만 (중간에 구멍이 생기지 않게)
export function lastDoneStep(methodId: string, completed: Record<string, string>): Step | null {
  const mod = moduleFor(methodId);
  if (!mod) return null;
  const done = mod.steps.filter((s) => completed[s.id]);
  return done[done.length - 1] ?? null;
}

export type CheckResult = 'ok' | 'locked' | 'needsRecord' | 'unknown';

// 체크 버튼으로 이 단계를 완료할 수 있는지
export function canCheck(methodId: string, stepId: string, completed: Record<string, string>): CheckResult {
  const step = moduleFor(methodId)?.steps.find((s) => s.id === stepId);
  if (!step) return 'unknown';
  if (stepStatuses(methodId, completed)[stepId] !== 'current') return 'locked';
  if (step.proof) return 'needsRecord';
  return 'ok';
}

export function methodOfStep(stepId: string): string | null {
  for (const m of METHODS) if (moduleFor(m.id)?.steps.some((s) => s.id === stepId)) return m.id;
  return null;
}

export function isModuleDone(methodId: string, completed: Record<string, string>): boolean {
  const mod = moduleFor(methodId);
  return !!mod && mod.steps.every((s) => completed[s.id]);
}

// 이 모듈로 남긴 기록 합계
export function moduleTotals(methodId: string, records: MoneyRecord[]) {
  const mine = records.filter((r) => r.methodId === methodId);
  const earned = mine.filter((r) => r.kind === 'earned').reduce((a, r) => a + r.amount, 0);
  const saved = mine.filter((r) => r.kind === 'saved').reduce((a, r) => a + r.amount, 0);
  return { earned, saved, total: earned + saved, count: mine.length };
}

// 다음에 시작하면 좋은 모듈: 맞춤 순위에서 아직 끝내지 않았고 진행 중도 아닌 첫 모듈
export function nextModule(profile: Profile, activeModules: string[], completed: Record<string, string>) {
  return (
    rankMethods(profile).find(
      (r) => r.method.available && !activeModules.includes(r.method.id) && !isModuleDone(r.method.id, completed),
    )?.method ?? null
  );
}
