import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Button, Card, Chip, Label } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { remindersSupported, requestReminderPermission, sendTestReminder } from '@/lib/notify';
import { useStore } from '@/lib/store';

const MORNING = [7, 8, 9, 12];
const EVENING = [19, 21, 22];
const hourLabel = (h: number) => (h < 12 ? `오전 ${h}시` : h === 12 ? '낮 12시' : `오후 ${h - 12}시`);

function useEnable() {
  const setReminders = useStore((s) => s.setReminders);
  const [denied, setDenied] = useState(false);
  const enable = async () => {
    const ok = await requestReminderPermission();
    setReminders({ enabled: ok, asked: true });
    setDenied(!ok);
  };
  return { enable, denied };
}

const DENIED_TEXT = '알림 권한이 꺼져 있어요. 휴대폰 설정 → 앱 → 돈길 → 알림에서 허용해 주세요.';

// 오늘 화면: 아직 알림을 안 켰으면 한 번 권한다.
export function ReminderPrompt() {
  const { enabled, asked } = useStore((s) => s.reminders);
  const setReminders = useStore((s) => s.setReminders);
  const { enable, denied } = useEnable();
  if (!remindersSupported || enabled || (asked && !denied)) return null;
  return (
    <Card style={styles.prompt}>
      <Label>매일 아침, 돈길이 먼저 알려 드릴게요</Label>
      <Body>오늘의 미션을 아침에 알려 주고, 며칠 멈추면 코치가 먼저 말을 걸어요. 저녁에는 하루 체크를 도와요.</Body>
      {denied ? (
        <Body muted>{DENIED_TEXT}</Body>
      ) : (
        <View style={styles.row}>
          <View style={{ flex: 2 }}>
            <Button testID="reminder-on" title="알림 받기" onPress={enable} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="나중에" kind="ghost" onPress={() => setReminders({ asked: true })} />
          </View>
        </View>
      )}
    </Card>
  );
}

// 내 정보 화면: 알림 켜기·끄기와 시각 선택
export function ReminderSettingsCard() {
  const { enabled, morningHour, eveningHour } = useStore((s) => s.reminders);
  const setReminders = useStore((s) => s.setReminders);
  const { enable, denied } = useEnable();
  const [testSent, setTestSent] = useState(false);
  const test = async () => setTestSent(await sendTestReminder());

  return (
    <Card>
      <Label>알림</Label>
      {!remindersSupported ? (
        <Body muted>알림은 휴대폰 앱에서만 받을 수 있어요.</Body>
      ) : enabled ? (
        <>
          <Body muted>오늘의 미션</Body>
          <View style={styles.chips}>
            {MORNING.map((h) => (
              <Chip key={h} label={hourLabel(h)} selected={morningHour === h} onPress={() => setReminders({ morningHour: h })} />
            ))}
          </View>
          <Body muted>저녁 체크인</Body>
          <View style={styles.chips}>
            {EVENING.map((h) => (
              <Chip key={h} label={hourLabel(h)} selected={eveningHour === h} onPress={() => setReminders({ eveningHour: h })} />
            ))}
          </View>
          <Button testID="reminder-test" title="테스트 알림 보내기 (10초 뒤)" kind="secondary" onPress={test} />
          {testSent && <Body muted>10초 뒤에 알림이 와요. 홈 화면으로 나가서 기다려 보세요.</Body>}
          <Button title="알림 끄기" kind="ghost" onPress={() => setReminders({ enabled: false })} />
        </>
      ) : (
        <>
          <Body muted>알림이 꺼져 있어요. 켜면 매일 미션과 저녁 체크인을 알려 드려요.</Body>
          {denied && <Body muted>{DENIED_TEXT}</Body>}
          <Button title="알림 켜기" onPress={enable} />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  prompt: { borderColor: Colors.gold, backgroundColor: '#FBF6E9' },
  row: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
