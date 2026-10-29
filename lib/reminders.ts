import { escortState, smallerStep, type Mission } from './escort';
import { methodById } from './methods';

export interface ReminderSettings {
  enabled: boolean;
  asked: boolean; // 오늘 화면에서 알림을 한 번 권했는지
  morningHour: number; // 오늘의 미션 알림 시각 (0~23)
  eveningHour: number; // 저녁 체크인 시각 (0~23)
}

export const DEFAULT_REMINDERS: ReminderSettings = { enabled: false, asked: false, morningHour: 8, eveningHour: 21 };

export interface PlannedReminder {
  id: string;
  date: Date;
  title: string;
  body: string;
}

// 앱을 다시 열지 않아도 2주 동안은 에스코트가 이어지도록 미리 잡아 둔다.
export const MORNING_DAYS = 14;
export const EVENING_DAYS = 7;

interface PlanInput {
  settings: ReminderSettings;
  mission: Mission | null;
  lastProgressAt: string | null;
  startedAt: string | null;
  now?: Date;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function at(base: Date, dayOffset: number, hour: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// 아침 알림 문구: 그날 기준으로 며칠째 멈춰 있는지에 따라 달라진다.
function morning(mission: Mission | null, lastProgressAt: string | null, startedAt: string | null, when: Date) {
  if (!mission) {
    return { title: '돈길 · 다음 길을 고를 차례예요', body: '진행 중인 모듈을 모두 끝냈어요. 돈길 지도에서 다음 방법을 골라 보세요.' };
  }
  const name = methodById(mission.methodId)?.name ?? '돈길';
  const state = escortState(lastProgressAt, startedAt, when);
  if (state === 'away') {
    return { title: '돈길 · 다시 시작해요', body: `쉬어도 괜찮아요. 밀린 건 잊고 오늘은 "${mission.step.title}" 하나만 가볍게 해 봐요.` };
  }
  if (state === 'stuck') {
    return { title: '돈길 · 코치가 먼저 왔어요', body: `며칠째 같은 단계에 머물러 있네요. ${smallerStep(mission.step)}` };
  }
  return { title: `오늘의 미션 · ${name}`, body: `${mission.step.title} (약 ${mission.step.minutes}분)` };
}

export function planReminders({ settings, mission, lastProgressAt, startedAt, now = new Date() }: PlanInput): PlannedReminder[] {
  if (!settings.enabled) return [];
  const out: PlannedReminder[] = [];

  for (let d = 0; d < MORNING_DAYS; d++) {
    const date = at(now, d, settings.morningHour);
    if (date <= now) continue;
    out.push({ id: `morning-${d}`, date, ...morning(mission, lastProgressAt, startedAt, date) });
  }

  if (mission) {
    const progressedToday = lastProgressAt ? sameDay(new Date(lastProgressAt), now) : false;
    for (let d = 0; d < EVENING_DAYS; d++) {
      const date = at(now, d, settings.eveningHour);
      if (date <= now) continue;
      if (d === 0 && progressedToday) continue; // 오늘 이미 한 걸음 걸었으면 저녁 알림은 쉰다
      out.push({
        id: `evening-${d}`,
        date,
        title: '돈길 · 오늘 하루 체크',
        body: '오늘 미션 했나요? 했다면 체크하고, 못 했다면 5분만 시작해 봐요.',
      });
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}
