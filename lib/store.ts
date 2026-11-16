import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { canCheck, lastDoneStep, methodOfStep, stepStatuses, type CheckResult } from './progress';
import { recommendStart } from './ranking';
import { DEFAULT_REMINDERS, type ReminderSettings } from './reminders';
import { moduleFor } from './modules';
import type { ChatMessage, MoneyRecord, Profile, Step } from './types';

interface State {
  hydrated: boolean;
  profile: Profile | null;
  startedAt: string | null;
  activeModules: string[];
  completed: Record<string, string>; // stepId -> 완료 시각
  lastProgressAt: string | null;
  records: MoneyRecord[];
  chat: ChatMessage[];
  reminders: ReminderSettings;
  completeOnboarding: (profile: Profile) => void;
  completeStep: (stepId: string) => CheckResult;
  undoStep: (stepId: string) => boolean;
  startModule: (methodId: string) => void;
  stopModule: (methodId: string) => void;
  addRecord: (r: Omit<MoneyRecord, 'id' | 'date'> & { date?: string }) => Step | null;
  removeRecord: (id: string) => void;
  pushChat: (m: ChatMessage) => void;
  setReminders: (patch: Partial<ReminderSettings>) => void;
  resetAll: () => void;
}

const initial = {
  profile: null,
  startedAt: null,
  activeModules: [] as string[],
  completed: {} as Record<string, string>,
  lastProgressAt: null,
  records: [] as MoneyRecord[],
  chat: [] as ChatMessage[],
  reminders: DEFAULT_REMINDERS,
};

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initial,
      completeOnboarding: (profile) => {
        const start = recommendStart(profile);
        const active = get().activeModules;
        set({
          profile,
          startedAt: get().startedAt ?? new Date().toISOString(),
          activeModules: active.length ? active : [start],
        });
      },
      completeStep: (stepId) => {
        const methodId = methodOfStep(stepId);
        if (!methodId) return 'unknown';
        const result = canCheck(methodId, stepId, get().completed);
        if (result !== 'ok') return result;
        const now = new Date().toISOString();
        set({ completed: { ...get().completed, [stepId]: now }, lastProgressAt: now });
        return 'ok';
      },
      undoStep: (stepId) => {
        const methodId = methodOfStep(stepId);
        if (!methodId || lastDoneStep(methodId, get().completed)?.id !== stepId) return false;
        const completed = { ...get().completed };
        delete completed[stepId];
        set({ completed });
        return true;
      },
      startModule: (methodId) => {
        const active = get().activeModules;
        if (!active.includes(methodId)) set({ activeModules: [...active, methodId] });
      },
      stopModule: (methodId) => set({ activeModules: get().activeModules.filter((m) => m !== methodId) }),
      addRecord: (r) => {
        const now = new Date().toISOString();
        // 지금 차례인 단계가 같은 종류의 '기록' 단계면 함께 완료 (완료 인증)
        const { completed } = get();
        let proofStep: Step | null = null;
        if (r.methodId) {
          const status = stepStatuses(r.methodId, completed);
          proofStep = moduleFor(r.methodId)?.steps.find((s) => status[s.id] === 'current' && s.proof === r.kind) ?? null;
        }
        set({
          records: [{ ...r, id: newId(), date: r.date ?? now }, ...get().records],
          completed: proofStep ? { ...completed, [proofStep.id]: now } : completed,
          lastProgressAt: now,
        });
        return proofStep;
      },
      removeRecord: (id) => set({ records: get().records.filter((r) => r.id !== id) }),
      pushChat: (m) => set({ chat: [...get().chat, m].slice(-100) }),
      setReminders: (patch) => set({ reminders: { ...get().reminders, ...patch } }),
      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'dongil-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);
