import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { PlannedReminder } from './reminders';

// 웹은 예약 알림을 지원하지 않아서 모든 함수가 아무것도 하지 않는다.
export const remindersSupported = Platform.OS !== 'web';

const CHANNEL = 'escort';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// 알림 권한을 요청한다. 허용되면 true.
export async function requestReminderPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: '오늘의 미션과 체크인',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

// 예약된 알림을 모두 지우고 새 계획대로 다시 잡는다.
export async function syncReminders(plan: PlannedReminder[]): Promise<void> {
  if (!remindersSupported) return;
  // 테스트 알림은 남겨 두고, 돈길이 잡은 아침·저녁 알림만 지운다
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith('morning-') || n.identifier.startsWith('evening-'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (plan.length === 0) return;
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;
  for (const r of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: r.id,
      content: { title: r.title, body: r.body, data: { url: '/' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL },
    });
  }
}

// 설정 화면의 '테스트 알림': 10초 뒤에 한 번 보낸다.
export async function sendTestReminder(): Promise<boolean> {
  if (!(await requestReminderPermission())) return false;
  await Notifications.scheduleNotificationAsync({
    identifier: 'test',
    content: { title: '돈길 · 테스트 알림', body: '알림이 잘 와요! 매일 아침 이렇게 오늘의 미션을 알려 드릴게요.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, channelId: CHANNEL },
  });
  return true;
}
