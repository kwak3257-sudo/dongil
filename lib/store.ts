import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { recommendStart } from './ranking';
import type { ChatMessage, MoneyRecord, Profile } from './types';

interface State {
  hydrated: boolean;
  profile: Profile | null;
  startedAt: string | null;
  activeModules: string[];
  completed: Record<string, string>; // stepId -> 완료 시각
  lastProgressAt: string | null;
  records: MoneyRecord[];
  chat: ChatMessage[];
  completeOnboarding: (profile: Profile) => void;
  toggleStep: (stepId: string) => void;
  startModule: (methodId: string) => void;
  stopModule: (methodId: string) => void;
  addRecord: (r: Omit<MoneyRecord, 'id' | 'date'> & { date?: string }) => void;
  removeRecord: (id: string) => void;
  pushChat: (m: ChatMessage) => void;
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
      toggleStep: (stepId) => {
        const completed = { ...get().completed };
        if (completed[stepId]) {
          delete completed[stepId];
          set({ completed });
        } else {
          const now = new Date().toISOString();
          completed[stepId] = now;
          set({ completed, lastProgressAt: now });
        }
      },
      startModule: (methodId) => {
        const active = get().activeModules;
        if (!active.includes(methodId)) set({ activeModules: [...active, methodId] });
      },
      stopModule: (methodId) => set({ activeModules: get().activeModules.filter((m) => m !== methodId) }),
      addRecord: (r) => {
        const now = new Date().toISOString();
        set({
          records: [{ ...r, id: newId(), date: r.date ?? now }, ...get().records],
          lastProgressAt: now,
        });
      },
      removeRecord: (id) => set({ records: get().records.filter((r) => r.id !== id) }),
      pushChat: (m) => set({ chat: [...get().chat, m].slice(-100) }),
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
