import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { ReminderSettingsCard } from '@/components/Reminders';
import { Body, Button, Card, Label, Screen } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { aiConnected } from '@/lib/ai';
import { useStore } from '@/lib/store';
import { won } from '@/lib/tools';

const CAPITAL = { none: '없음', small: '100만 원 이하', mid: '1,000만 원 이하', large: '1,000만 원 초과' };
const INCOME = { salary: '직장인', business: '자영업·프리랜서', student: '학생', none: '소득 없음' };
const RISK = { low: '원금 손실 싫음', mid: '조금은 괜찮음', high: '감수 가능' };
const SKILL: Record<string, string> = { design: '디자인', video: '영상 편집', dev: '개발', writing: '글쓰기', language: '외국어', excel: '엑셀·문서', teaching: '가르치기', sales: '영업·판매' };

export default function Profile() {
  const { profile, resetAll } = useStore();
  const [confirm, setConfirm] = useState(false);
  if (!profile) return null;

  return (
    <Screen>
      <View style={{ paddingVertical: 4 }}>
        <Logo size={22} tagline />
      </View>
      <Card>
        <Label>내 상황</Label>
        <Row k="시작 자금" v={CAPITAL[profile.capital]} />
        <Row k="주당 시간" v={`약 ${profile.hoursPerWeek}시간`} />
        <Row k="기술" v={profile.skills.map((s) => SKILL[s]).join(', ') || '없음'} />
        <Row k="소득 형태" v={INCOME[profile.incomeType]} />
        <Row k="월 목표" v={won(profile.goalMonthly)} />
        <Row k="위험 성향" v={RISK[profile.risk]} />
      </Card>
      <ReminderSettingsCard />
      <Card>
        <Label>AI 코치</Label>
        <Body muted>{aiConnected ? 'AI 서버에 연결되어 있어요.' : '기본 코치로 동작 중이에요. EXPO_PUBLIC_AI_ENDPOINT를 설정하면 AI 코치가 켜져요.'}</Body>
      </Card>
      <Card>
        <Label>데이터</Label>
        <Body muted>기록과 진행 상황은 이 기기에만 저장돼요.</Body>
        {!confirm ? (
          <Button title="처음부터 다시 하기" kind="ghost" onPress={() => setConfirm(true)} />
        ) : (
          <>
            <Body>모든 진행 상황과 기록이 지워져요. 정말 다시 시작할까요?</Body>
            <Button testID="confirm-reset" title="네, 모두 지우고 다시 시작" onPress={resetAll} />
            <Button title="취소" kind="ghost" onPress={() => setConfirm(false)} />
          </>
        )}
      </Card>
      <Text style={styles.disclaimer}>
        돈길이 제공하는 내용은 일반 정보이며 수익을 보장하지 않습니다. 특정 금융상품을 추천하지 않으며, 세금·법률 판단은 전문가와 상의하세요.
      </Text>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 12 },
  k: { color: Colors.textMuted, fontSize: 14 },
  v: { color: Colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  disclaimer: { fontSize: 12, lineHeight: 18, color: Colors.textMuted },
});
