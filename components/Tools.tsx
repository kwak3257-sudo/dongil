import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Field, Label, toNumber } from '@/components/ui';
import { Colors } from '@/constants/theme';
import {
  emergencyFund,
  freelanceNet,
  listingDraft,
  pensionTaxCredit,
  subscriptionTotals,
  TAX_RULE,
  won,
  type Subscription,
} from '@/lib/tools';
import type { ToolId } from '@/lib/types';

function SubscriptionTool() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const t = subscriptionTotals(items);
  const add = () => {
    if (!name.trim() || toNumber(price) <= 0) return;
    setItems([...items, { name: name.trim(), monthly: toNumber(price) }]);
    setName('');
    setPrice('');
  };
  return (
    <View>
      <Field label="서비스 이름" value={name} onChangeText={setName} placeholder="예: 넷플릭스" />
      <Field label="월 금액(원)" value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="예: 13500" />
      <Button title="목록에 추가" kind="secondary" onPress={add} />
      {items.map((i, idx) => (
        <Pressable
          key={`${i.name}-${idx}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!i.unused }}
          onPress={() => setItems(items.map((x, j) => (j === idx ? { ...x, unused: !x.unused } : x)))}
          style={styles.row}>
          <Text style={[styles.rowText, i.unused && styles.unused]}>{i.unused ? '☑' : '☐'} {i.name}</Text>
          <Text style={styles.rowText}>{won(i.monthly)}</Text>
        </Pressable>
      ))}
      {items.length > 0 && (
        <View style={styles.result}>
          <Body>월 {won(t.monthly)} · 1년 {won(t.yearly)}</Body>
          <Body muted>안 쓰는 것(체크)만 해지하면 1년에 {won(t.unusedYearly)}을 아낄 수 있어요.</Body>
        </View>
      )}
    </View>
  );
}

function EmergencyTool() {
  const [expense, setExpense] = useState('');
  const [months, setMonths] = useState('3');
  const [current, setCurrent] = useState('');
  const [saving, setSaving] = useState('');
  const r = emergencyFund(toNumber(expense), toNumber(months), toNumber(current), toNumber(saving));
  return (
    <View>
      <Field label="한 달 생활비(원)" value={expense} onChangeText={setExpense} keyboardType="number-pad" />
      <Field label="몇 개월치 모을까요? (3~6 추천)" value={months} onChangeText={setMonths} keyboardType="number-pad" />
      <Field label="지금 모은 돈(원)" value={current} onChangeText={setCurrent} keyboardType="number-pad" />
      <Field label="매달 모을 금액(원)" value={saving} onChangeText={setSaving} keyboardType="number-pad" />
      {r.target > 0 && (
        <View style={styles.result}>
          <Body>목표 비상금 {won(r.target)}</Body>
          <Body muted>
            {r.remaining === 0
              ? '이미 목표를 채웠어요!'
              : r.monthsToReach
                ? `남은 ${won(r.remaining)}, 약 ${r.monthsToReach}개월 뒤 달성`
                : `남은 ${won(r.remaining)}. 매달 모을 금액을 넣어 보세요.`}
          </Body>
        </View>
      )}
    </View>
  );
}

function TaxTool() {
  const [salary, setSalary] = useState('');
  const [pension, setPension] = useState('');
  const [irp, setIrp] = useState('');
  const r = pensionTaxCredit(toNumber(salary), toNumber(pension), toNumber(irp));
  return (
    <View>
      <Field label="작년 총급여(원)" value={salary} onChangeText={setSalary} keyboardType="number-pad" placeholder="예: 40000000" />
      <Field label="연금저축 연간 납입액(원)" value={pension} onChangeText={setPension} keyboardType="number-pad" />
      <Field label="IRP 연간 납입액(원)" value={irp} onChangeText={setIrp} keyboardType="number-pad" />
      {r.eligible > 0 && (
        <View style={styles.result}>
          <Body>예상 세액공제 {won(r.credit)}</Body>
          <Body muted>
            공제 대상 {won(r.eligible)} × {(r.rate * 100).toFixed(1)}%. {TAX_RULE.year}년 귀속 기준이며 실제 금액은 다른 공제와 납부세액에 따라 달라질 수 있어요.
          </Body>
        </View>
      )}
    </View>
  );
}

function QuoteTool() {
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('20');
  const [hours, setHours] = useState('');
  const r = freelanceNet(toNumber(price), toNumber(fee) / 100, toNumber(hours));
  return (
    <View>
      <Field label="판매 가격(원)" value={price} onChangeText={setPrice} keyboardType="number-pad" />
      <Field label="플랫폼 수수료(%)" value={fee} onChangeText={setFee} keyboardType="number-pad" />
      <Field label="예상 작업 시간(시간)" value={hours} onChangeText={setHours} keyboardType="number-pad" />
      {toNumber(price) > 0 && (
        <View style={styles.result}>
          <Body>실수령 약 {won(r.net)}</Body>
          <Body muted>
            수수료 {won(r.fee)}, 원천징수(3.3%) {won(r.withholding)}
            {r.hourly !== null ? ` · 시급 약 ${won(r.hourly)}` : ''}
          </Body>
        </View>
      )}
    </View>
  );
}

function ListingTool() {
  const [skill, setSkill] = useState('');
  const [exp, setExp] = useState('');
  const [deliverable, setDeliverable] = useState('');
  const [draft, setDraft] = useState('');
  return (
    <View>
      <Field label="어떤 작업인가요?" value={skill} onChangeText={setSkill} placeholder="예: 유튜브 썸네일 디자인" />
      <Field label="관련 경험" value={exp} onChangeText={setExp} placeholder="예: 3년 차 디자이너" />
      <Field label="고객이 받는 결과물" value={deliverable} onChangeText={setDeliverable} placeholder="예: 썸네일 PNG 2종" />
      <Button title="소개글 초안 만들기" kind="secondary" onPress={() => setDraft(listingDraft(skill, exp, deliverable))} />
      {!!draft && (
        <View style={styles.result}>
          <Text selectable style={styles.draft}>
            {draft}
          </Text>
          <Body muted>내 말투로 고치고, 작업 범위와 수정 횟수를 꼭 확인하세요.</Body>
        </View>
      )}
    </View>
  );
}

const TITLES: Record<ToolId, string> = {
  subscriptions: '구독 계산기',
  emergency: '비상금 계산기',
  taxCredit: '세액공제 계산기',
  quote: '견적·실수령 계산기',
  listing: '소개글 생성기',
};

export function ToolCard({ id }: { id: ToolId }) {
  return (
    <Card>
      <Label>도구 · {TITLES[id]}</Label>
      {id === 'subscriptions' && <SubscriptionTool />}
      {id === 'emergency' && <EmergencyTool />}
      {id === 'taxCredit' && <TaxTool />}
      {id === 'quote' && <QuoteTool />}
      {id === 'listing' && <ListingTool />}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: Colors.border },
  rowText: { fontSize: 15, color: Colors.text },
  unused: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  result: { marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: '#FBF6E9', gap: 4 },
  draft: { fontSize: 14, lineHeight: 21, color: Colors.text },
});
