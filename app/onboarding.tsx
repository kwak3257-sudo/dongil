import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { Body, Button, Card, Chip, Field, Label, Progress, Screen, Title, toNumber } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { methodById } from '@/lib/methods';
import { rankMethods } from '@/lib/ranking';
import { useStore } from '@/lib/store';
import type { Capital, IncomeType, Profile, RiskLevel, Skill } from '@/lib/types';

const CAPITALS: { v: Capital; label: string }[] = [
  { v: 'none', label: '없음 (0원)' },
  { v: 'small', label: '100만 원 이하' },
  { v: 'mid', label: '1,000만 원 이하' },
  { v: 'large', label: '1,000만 원 초과' },
];
const HOURS = [
  { v: 3, label: '주 3시간 이하' },
  { v: 7, label: '주 4~10시간' },
  { v: 15, label: '주 10~20시간' },
  { v: 25, label: '주 20시간 이상' },
];
const SKILLS: { v: Skill; label: string }[] = [
  { v: 'design', label: '디자인' },
  { v: 'video', label: '영상 편집' },
  { v: 'dev', label: '개발' },
  { v: 'writing', label: '글쓰기' },
  { v: 'language', label: '외국어' },
  { v: 'excel', label: '엑셀·문서' },
  { v: 'teaching', label: '가르치기' },
  { v: 'sales', label: '영업·판매' },
];
const INCOMES: { v: IncomeType; label: string }[] = [
  { v: 'salary', label: '직장인 (근로소득)' },
  { v: 'business', label: '자영업·프리랜서' },
  { v: 'student', label: '학생' },
  { v: 'none', label: '현재 소득 없음' },
];
const RISKS: { v: RiskLevel; label: string }[] = [
  { v: 'low', label: '원금 손실은 싫어요' },
  { v: 'mid', label: '조금은 괜찮아요' },
  { v: 'high', label: '감수할 수 있어요' },
];

const TOTAL = 6;

export default function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [capital, setCapital] = useState<Capital | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [income, setIncome] = useState<IncomeType | null>(null);
  const [goal, setGoal] = useState('');
  const [risk, setRisk] = useState<RiskLevel | null>(null);

  const canNext = [capital !== null, hours !== null, true, income !== null, toNumber(goal) > 0, risk !== null][step - 1] ?? true;

  const profile: Profile | null =
    capital && hours && income && risk ? { capital, hoursPerWeek: hours, skills, incomeType: income, goalMonthly: toNumber(goal), risk } : null;

  if (step === 0) {
    return (
      <Screen>
        <View style={styles.hero}>
          <Logo size={34} onDark tagline />
          <Text style={styles.heroTitle}>첫 수익까지,{'\n'}돈길이 끝까지 함께 걸어요</Text>
          <Text style={styles.heroBody}>6가지만 물어볼게요. 답에 맞춰 지금 시작하기 좋은 방법의 순서와 오늘 할 일을 정해 드려요.</Text>
        </View>
        <Button testID="start" title="시작하기" onPress={() => setStep(1)} />
      </Screen>
    );
  }

  if (step > TOTAL && profile) {
    const ranked = rankMethods(profile).slice(0, 3);
    return (
      <Screen>
        <Label>나의 돈길</Label>
        <Title>지금 시작하기 좋은 순서예요</Title>
        {ranked.map((r, i) => (
          <Card key={r.method.id} accent={i === 0}>
            <Text style={[styles.rank, i === 0 && { color: Colors.gold }]}>{i + 1}순위</Text>
            <Text style={[styles.methodName, i === 0 && { color: Colors.cream }]}>
              {r.method.name}
              {!r.method.available && <Text style={styles.soon}>  준비 중</Text>}
            </Text>
            <Text style={[styles.reason, i === 0 && { color: Colors.goldSoft }]}>{r.reasons.slice(0, 2).join(' · ') || r.method.summary}</Text>
          </Card>
        ))}
        <Body muted>
          {ranked[0] && !ranked[0].method.available
            ? `${ranked[0].method.name} 모듈은 준비 중이라, 지금 바로 따라 할 수 있는 ${methodById(ranked.find((r) => r.method.available)?.method.id ?? 'spending')?.name} 모듈부터 시작해요.`
            : '1순위 모듈의 첫 미션부터 바로 시작해요.'}
        </Body>
        <Button testID="finish" title="첫 미션 받기" onPress={() => complete(profile)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Progress value={step} total={TOTAL} />
      <Label>
        질문 {step} / {TOTAL}
      </Label>
      {step === 1 && (
        <>
          <Title>시작에 쓸 수 있는 돈이 얼마인가요?</Title>
          <View style={styles.chips}>
            {CAPITALS.map((c) => (
              <Chip key={c.v} label={c.label} selected={capital === c.v} onPress={() => setCapital(c.v)} />
            ))}
          </View>
        </>
      )}
      {step === 2 && (
        <>
          <Title>일주일에 얼마나 시간을 낼 수 있나요?</Title>
          <View style={styles.chips}>
            {HOURS.map((h) => (
              <Chip key={h.v} label={h.label} selected={hours === h.v} onPress={() => setHours(h.v)} />
            ))}
          </View>
        </>
      )}
      {step === 3 && (
        <>
          <Title>할 줄 아는 것을 모두 골라 주세요</Title>
          <Body muted>없으면 그냥 다음으로 넘어가도 돼요.</Body>
          <View style={styles.chips}>
            {SKILLS.map((s) => (
              <Chip
                key={s.v}
                label={s.label}
                selected={skills.includes(s.v)}
                onPress={() => setSkills(skills.includes(s.v) ? skills.filter((x) => x !== s.v) : [...skills, s.v])}
              />
            ))}
          </View>
        </>
      )}
      {step === 4 && (
        <>
          <Title>지금 소득은 어떤 형태인가요?</Title>
          <View style={styles.chips}>
            {INCOMES.map((c) => (
              <Chip key={c.v} label={c.label} selected={income === c.v} onPress={() => setIncome(c.v)} />
            ))}
          </View>
        </>
      )}
      {step === 5 && (
        <>
          <Title>한 달에 얼마를 더 만들고 싶나요?</Title>
          <Field label="월 목표 금액(원)" value={goal} onChangeText={setGoal} keyboardType="number-pad" placeholder="예: 500000" testID="goal" />
          <View style={styles.chips}>
            {[300000, 500000, 1000000, 3000000].map((g) => (
              <Chip key={g} label={`${g / 10000}만 원`} selected={toNumber(goal) === g} onPress={() => setGoal(String(g))} />
            ))}
          </View>
        </>
      )}
      {step === 6 && (
        <>
          <Title>돈을 잃을 수 있는 방법은 어떠세요?</Title>
          <View style={styles.chips}>
            {RISKS.map((c) => (
              <Chip key={c.v} label={c.label} selected={risk === c.v} onPress={() => setRisk(c.v)} />
            ))}
          </View>
        </>
      )}
      <View style={styles.nav}>
        <View style={{ flex: 1 }}>
          <Button title="이전" kind="ghost" onPress={() => setStep(step - 1)} />
        </View>
        <View style={{ flex: 2 }}>
          <Button testID="next" title={step === TOTAL ? '결과 보기' : '다음'} disabled={!canNext} onPress={() => setStep(step + 1)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: Colors.navy, borderRadius: 20, padding: 24, gap: 16, marginTop: 24 },
  heroTitle: { fontFamily: Fonts.serifKoBold, fontSize: 26, lineHeight: 36, color: Colors.cream },
  heroBody: { fontSize: 15, lineHeight: 22, color: Colors.goldSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nav: { flexDirection: 'row', gap: 10, marginTop: 8 },
  rank: { fontSize: 12, fontWeight: '700', color: Colors.gold },
  methodName: { fontFamily: Fonts.serifKoBold, fontSize: 18, color: Colors.navy },
  reason: { fontSize: 14, color: Colors.textMuted },
  soon: { fontFamily: undefined, fontSize: 12, fontWeight: '700', color: Colors.textMuted },
});
