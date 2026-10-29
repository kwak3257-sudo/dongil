import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ToolCard } from '@/components/Tools';
import { Body, Button, Card, Label, Progress, Screen, Title } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { describeContext, personalTips } from '@/lib/ai';
import { methodById } from '@/lib/methods';
import { moduleFor, PHASE_LABEL } from '@/lib/modules';
import { isModuleDone, lastDoneStep, moduleTotals, nextModule, stepStatuses } from '@/lib/progress';
import { useStore } from '@/lib/store';
import { won } from '@/lib/tools';
import type { Phase } from '@/lib/types';

const PHASES: Phase[] = ['week1', 'day30', 'day90'];

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const method = methodById(id);
  const mod = moduleFor(id);
  const { profile, activeModules, completed, records, completeStep, undoStep, startModule, stopModule } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [tips, setTips] = useState<Record<string, string>>({});
  const isActive = activeModules.includes(id);

  useEffect(() => {
    if (!profile || !mod) return;
    let alive = true;
    personalTips(id, profile, describeContext(profile, activeModules)).then((t) => alive && setTips(t));
    return () => {
      alive = false;
    };
    // 모듈이 바뀔 때만 다시 받아온다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!method || !mod) {
    return (
      <Screen>
        <Stack.Screen options={{ title: '준비 중' }} />
        <Title>이 모듈은 준비 중이에요</Title>
        <Button title="돌아가기" onPress={() => router.back()} />
      </Screen>
    );
  }

  const done = mod.steps.filter((s) => completed[s.id]).length;
  const status = stepStatuses(id, completed);
  const undoId = lastDoneStep(id, completed)?.id;
  const finished = isModuleDone(id, completed);
  const totals = moduleTotals(id, records);
  const next = finished && profile ? nextModule(profile, activeModules, completed) : null;
  // 다음 할 단계는 기본으로 펼쳐 둔다
  const nextId = mod.steps.find((s) => status[s.id] === 'current')?.id;
  const expanded = open ?? nextId;

  const finishProps = {
    name: method.name,
    steps: mod.steps.length,
    totals,
    next,
    onNext: (nextId: string) => {
      startModule(nextId);
      router.replace(`/module/${nextId}`);
    },
  };

  const press = (stepId: string) => {
    if (status[stepId] === 'done') {
      if (stepId === undoId) undoStep(stepId);
      return;
    }
    const result = completeStep(stepId);
    // 끝냈으면 다음 차례 단계를 펼치고, 잠긴 단계나 기록 단계는 그 안내를 펼쳐 보여 준다
    setOpen(result === 'ok' ? null : stepId);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: method.name }} />
      <Label>{method.name}</Label>
      <Title>{method.summary}</Title>
      <Progress value={done} total={mod.steps.length} />
      <Body muted>
        {mod.steps.length}단계 중 {done}단계 완료
      </Body>
      {finished && <FinishCard {...finishProps} testID="start-next-top" />}
      {!isActive ? (
        <Button testID="start-module" title="이 방법 시작하기" onPress={() => startModule(id)} />
      ) : (
        activeModules.length > 1 && <Button title="잠시 쉬기 (진행 목록에서 빼기)" kind="ghost" onPress={() => stopModule(id)} />
      )}

      {PHASES.map((phase) => (
        <View key={phase} style={{ gap: 8 }}>
          <Text style={styles.phase}>{PHASE_LABEL[phase]}</Text>
          {mod.steps
            .filter((s) => s.phase === phase)
            .map((s) => {
              const st = status[s.id];
              const isDone = st === 'done';
              const isLocked = st === 'locked';
              const isOpen = expanded === s.id;
              return (
                <Card key={s.id} style={isDone ? styles.doneCard : isLocked ? styles.lockedCard : undefined}>
                  <View style={styles.stepRow}>
                    <Pressable
                      testID={`check-${s.id}`}
                      accessibilityRole="checkbox"
                      aria-checked={isDone}
                      aria-disabled={isLocked || (isDone && s.id !== undoId)}
                      accessibilityLabel={s.title}
                      onPress={() => press(s.id)}
                      hitSlop={8}
                      style={[styles.box, isDone && styles.boxOn, isLocked && styles.boxLocked, st === 'current' && s.proof && styles.boxProof]}>
                      {isDone && <Text style={styles.check}>✓</Text>}
                      {isLocked && <Text style={styles.lock}>🔒</Text>}
                    </Pressable>
                    <Pressable style={{ flex: 1 }} onPress={() => setOpen(isOpen ? '' : s.id)}>
                      <Text style={[styles.stepTitle, isDone && styles.stepDone]}>{s.title}</Text>
                      <Text style={styles.meta}>
                        약 {s.minutes}분{s.proof ? ` · ${s.proof === 'earned' ? '번 돈' : '아낀 돈'} 기록` : ''}
                      </Text>
                    </Pressable>
                  </View>
                  {isOpen && (
                    <View style={styles.guide}>
                      {s.guide.map((g, i) => (
                        <Text key={i} style={styles.guideText}>
                          {i + 1}. {g}
                        </Text>
                      ))}
                      {s.tip && <Text style={styles.tip}>TIP · {s.tip}</Text>}
                      {tips[s.id] && <Text style={styles.tip}>나에게 맞춘 팁 · {tips[s.id]}</Text>}
                      {isLocked && <Text style={styles.hint}>앞 단계를 끝내면 열려요. 미리 읽어 두기만 하세요.</Text>}
                      {st === 'current' && s.proof && (
                        <>
                          <Text style={styles.hint}>
                            이 단계는 체크로 끝나지 않아요. 실제로 {s.proof === 'earned' ? '번 돈' : '아낀 돈'}을 기록하면 자동으로 완료돼요.
                          </Text>
                          <Button
                            testID={`record-${s.id}`}
                            title="기록하러 가기"
                            kind="secondary"
                            onPress={() => router.push({ pathname: '/records', params: { methodId: id, kind: s.proof } })}
                          />
                        </>
                      )}
                      {isDone && s.id === undoId && <Text style={styles.hint}>잘못 눌렀다면 체크 표시를 다시 눌러 되돌릴 수 있어요.</Text>}
                    </View>
                  )}
                  {isOpen && s.tool && <ToolCard id={s.tool} />}
                </Card>
              );
            })}
        </View>
      ))}
      {finished && <FinishCard {...finishProps} testID="start-next" />}
    </Screen>
  );
}

function FinishCard({
  name,
  steps,
  totals,
  next,
  onNext,
  testID,
}: {
  name: string;
  steps: number;
  totals: { earned: number; saved: number; count: number };
  next: { id: string; name: string } | null;
  onNext: (id: string) => void;
  testID: string;
}) {
  return (
    <Card accent>
      <Text style={styles.doneTitle}>완주했어요! 🎉</Text>
      <Text style={styles.doneBody}>
        {name}의 {steps}단계를 모두 마쳤어요.
        {totals.count > 0 ? ` 이 길에서 번 돈 ${won(totals.earned)}, 아낀 돈 ${won(totals.saved)}을 기록했어요.` : ''}
      </Text>
      {next ? (
        <Button testID={testID} title={`다음 길: ${next.name} 시작하기`} kind="secondary" onPress={() => onNext(next.id)} />
      ) : (
        <Text style={styles.doneBody}>지금 열린 모듈은 모두 끝냈어요. 새 모듈이 열리면 알려 드릴게요.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  phase: { fontSize: 13, fontWeight: '700', color: Colors.gold, marginTop: 8 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  box: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: Colors.navy, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: Colors.navy },
  check: { color: Colors.cream, fontWeight: '800' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  stepDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  doneCard: { opacity: 0.75 },
  lockedCard: { opacity: 0.6 },
  boxLocked: { borderColor: Colors.border },
  boxProof: { borderStyle: 'dashed', borderColor: Colors.gold },
  lock: { fontSize: 11 },
  hint: { fontSize: 13, lineHeight: 19, color: Colors.textMuted },
  doneTitle: { fontFamily: Fonts.serifKoBold, fontSize: 22, color: Colors.cream },
  doneBody: { fontSize: 14, lineHeight: 21, color: Colors.goldSoft },
  guide: { gap: 6, paddingLeft: 38 },
  guideText: { fontSize: 14, lineHeight: 21, color: Colors.text },
  tip: { fontSize: 13, lineHeight: 19, color: Colors.warn },
});
