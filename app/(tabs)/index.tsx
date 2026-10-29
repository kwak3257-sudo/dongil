import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { Body, Button, Card, Label, Progress, Screen } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { escortState, firstIncomeMap, smallerStep, todayMission } from '@/lib/escort';
import { methodById } from '@/lib/methods';
import { PHASE_LABEL } from '@/lib/modules';
import { monthlyTotals } from '@/lib/records';
import { useStore } from '@/lib/store';
import { won } from '@/lib/tools';

export default function Today() {
  const router = useRouter();
  const { profile, activeModules, completed, lastProgressAt, startedAt, records, toggleStep } = useStore();
  const mission = todayMission(activeModules, completed);
  const state = escortState(lastProgressAt, startedAt);
  const totals = monthlyTotals(records);
  const goal = profile?.goalMonthly ?? 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Logo size={24} />
      </View>

      {state === 'stuck' && mission && (
        <Card style={styles.nudge}>
          <Label>코치가 먼저 왔어요</Label>
          <Body>며칠째 같은 단계에 머물러 있네요. {smallerStep(mission.step)}</Body>
          <Button title="코치에게 물어보기" kind="ghost" onPress={() => router.push('/coach')} />
        </Card>
      )}
      {state === 'away' && mission && (
        <Card style={styles.nudge}>
          <Label>다시 시작해요</Label>
          <Body>쉬어도 괜찮아요. 밀린 건 잊고, 오늘은 아래 미션 하나만 가볍게 해 봐요.</Body>
        </Card>
      )}

      {mission ? (
        <Card accent>
          <Text style={styles.missionLabel}>
            오늘의 미션 · {methodById(mission.methodId)?.name} · {PHASE_LABEL[mission.step.phase]}
          </Text>
          <Text style={styles.missionTitle}>{mission.step.title}</Text>
          <Text style={styles.missionMeta}>약 {mission.step.minutes}분 · {mission.index + 1}/{mission.total}단계</Text>
          <View style={styles.guide}>
            {mission.step.guide.map((g, i) => (
              <Text key={i} style={styles.guideText}>
                {i + 1}. {g}
              </Text>
            ))}
          </View>
          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Button testID="mission-done" title="완료했어요" kind="secondary" onPress={() => toggleStep(mission.step.id)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="자세히 보기" kind="light" onPress={() => router.push(`/module/${mission.methodId}`)} />
            </View>
          </View>
          {mission.step.proof && (
            <Text style={styles.proofHint}>이 단계는 {mission.step.proof === 'earned' ? '번 돈' : '아낀 돈'}을 기록 탭에 남겨야 진짜 완료예요.</Text>
          )}
        </Card>
      ) : (
        <Card accent>
          <Text style={styles.missionTitle}>진행 중인 모듈을 모두 끝냈어요!</Text>
          <Text style={styles.missionMeta}>돈길 지도에서 다음 방법을 골라 이어 가요.</Text>
          <Button title="돈길 지도 열기" kind="secondary" onPress={() => router.push('/modules')} />
        </Card>
      )}

      {activeModules.map((id) => {
        const map = firstIncomeMap(id, completed);
        if (!map) return null;
        return (
          <Card key={id}>
            <Label>첫 수익 지도 · {methodById(id)?.name}</Label>
            <Body>
              {map.reached ? `${map.goalLabel} 단계에 도착했어요!` : `${map.goalLabel}까지 ${map.total}단계 중 ${map.done}단계`}
            </Body>
            <Progress value={map.done} total={map.total} />
            <Body muted>
              전체 {map.overallTotal}단계 중 {map.overallDone}단계 완료
            </Body>
          </Card>
        );
      })}

      <Card>
        <Label>이번 달 성과</Label>
        <Text style={styles.big}>{won(totals.total)}</Text>
        <Body muted>
          번 돈 {won(totals.earned)} · 아낀 돈 {won(totals.saved)}
        </Body>
        {goal > 0 && (
          <>
            <Progress value={totals.total} total={goal} />
            <Body muted>월 목표 {won(goal)}의 {Math.min(100, Math.round((totals.total / goal) * 100))}%</Body>
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 4 },
  nudge: { borderColor: Colors.gold, backgroundColor: '#FBF6E9' },
  missionLabel: { fontSize: 12, fontWeight: '700', color: Colors.gold },
  missionTitle: { fontFamily: Fonts.serifKoBold, fontSize: 21, lineHeight: 29, color: Colors.cream },
  missionMeta: { fontSize: 13, color: Colors.goldSoft },
  guide: { gap: 6, paddingVertical: 6 },
  guideText: { fontSize: 14, lineHeight: 20, color: Colors.cream },
  actions: { flexDirection: 'row', gap: 8 },
  proofHint: { fontSize: 12, color: Colors.goldSoft },
  big: { fontFamily: Fonts.serifKoBold, fontSize: 26, color: Colors.navy },
});
