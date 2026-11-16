import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Chip, Field, Label, Progress, Screen, Title, toNumber } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { methodById } from '@/lib/methods';
import { monthlyTotals } from '@/lib/records';
import { useStore } from '@/lib/store';
import { won } from '@/lib/tools';

export default function Records() {
  const params = useLocalSearchParams<{ methodId?: string; kind?: 'earned' | 'saved' }>();
  const { profile, records, activeModules, addRecord, removeRecord } = useStore();
  const [kind, setKind] = useState<'earned' | 'saved'>(params.kind ?? 'saved');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [methodId, setMethodId] = useState<string | undefined>(params.methodId ?? activeModules[0]);
  const [saved, setSaved] = useState('');

  // 모듈의 '기록하러 가기'로 다시 들어오면 값을 미리 채운다
  const [prevParams, setPrevParams] = useState({ kind: params.kind, methodId: params.methodId });
  if (prevParams.kind !== params.kind || prevParams.methodId !== params.methodId) {
    setPrevParams({ kind: params.kind, methodId: params.methodId });
    if (params.kind) setKind(params.kind);
    if (params.methodId) setMethodId(params.methodId);
  }

  const totals = monthlyTotals(records);
  const goal = profile?.goalMonthly ?? 0;

  const submit = () => {
    const value = toNumber(amount);
    if (value <= 0) return;
    const proofStep = addRecord({ kind, amount: value, methodId, memo: memo.trim() || undefined });
    setAmount('');
    setMemo('');
    setSaved(proofStep ? `기록했어요. "${proofStep.title}" 단계도 완료했어요!` : '기록했어요.');
  };

  return (
    <Screen>
      <Label>기록</Label>
      <Title>번 돈과 아낀 돈</Title>
      <Card>
        <Label>이번 달</Label>
        <Text style={styles.big}>{won(totals.total)}</Text>
        <Body muted>
          번 돈 {won(totals.earned)} · 아낀 돈 {won(totals.saved)} · 누적 {won(totals.allTime)}
        </Body>
        {goal > 0 && <Progress value={totals.total} total={goal} />}
      </Card>

      <Card>
        <Label>새 기록</Label>
        <View style={styles.chips}>
          <Chip label="아낀 돈" selected={kind === 'saved'} onPress={() => setKind('saved')} />
          <Chip label="번 돈" selected={kind === 'earned'} onPress={() => setKind('earned')} />
        </View>
        <Field label="금액(원)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="예: 13500" testID="amount" />
        <Field label="메모 (선택)" value={memo} onChangeText={setMemo} placeholder="예: OTT 1개 해지" />
        {activeModules.length > 0 && (
          <View style={styles.chips}>
            {activeModules.map((id) => (
              <Chip key={id} label={methodById(id)?.name ?? id} selected={methodId === id} onPress={() => setMethodId(id)} />
            ))}
          </View>
        )}
        <Button testID="save-record" title="기록하기" onPress={submit} disabled={toNumber(amount) <= 0} />
        {!!saved && <Text style={styles.saved}>{saved}</Text>}
      </Card>

      {records.length === 0 ? (
        <Body muted>아직 기록이 없어요. 작은 금액이라도 남기면 돈길이 성과를 모아 보여줘요.</Body>
      ) : (
        records.map((r) => (
          <View key={r.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {r.kind === 'earned' ? '번 돈' : '아낀 돈'} · {won(r.amount)}
              </Text>
              <Text style={styles.rowMeta}>
                {new Date(r.date).toLocaleDateString('ko-KR')}
                {r.methodId ? ` · ${methodById(r.methodId)?.name}` : ''}
                {r.memo ? ` · ${r.memo}` : ''}
              </Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="기록 삭제" onPress={() => removeRecord(r.id)} hitSlop={8}>
              <Text style={styles.del}>삭제</Text>
            </Pressable>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: Fonts.serifKoBold, fontSize: 26, color: Colors.navy },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  saved: { color: Colors.good, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  rowTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  rowMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  del: { color: Colors.danger, fontSize: 13 },
});
