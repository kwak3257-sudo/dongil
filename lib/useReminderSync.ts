import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayMission } from './escort';
import { syncReminders } from './notify';
import { planReminders } from './reminders';
import { useStore } from './store';

// 미션·진행·설정이 바뀌거나 앱으로 돌아올 때마다 알림 예약을 새로 맞춘다.
export function useReminderSync() {
  const { hydrated, reminders, activeModules, completed, lastProgressAt, startedAt, profile } = useStore();
  const [foregroundTick, setForegroundTick] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setForegroundTick((t) => t + 1));
    return () => sub.remove();
  }, []);

  const mission = todayMission(activeModules, completed);
  const missionKey = mission ? mission.step.id : 'none';

  useEffect(() => {
    if (!hydrated) return;
    const plan = planReminders({
      settings: profile ? reminders : { ...reminders, enabled: false },
      mission: todayMission(activeModules, completed),
      lastProgressAt,
      startedAt,
    });
    syncReminders(plan).catch(() => {});
    // missionKey가 바뀔 때만 다시 잡으면 되므로 activeModules·completed는 의존성에서 뺀다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, reminders, missionKey, lastProgressAt, startedAt, profile, foregroundTick]);
}
