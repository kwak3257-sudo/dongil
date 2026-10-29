import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Label, Screen, Title } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { rankMethods } from '@/lib/ranking';
import { useStore } from '@/lib/store';

export default function Modules() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const active = useStore((s) => s.activeModules);
  if (!profile) return null;
  const ranked = rankMethods(profile);

  return (
    <Screen>
      <Label>돈길 지도</Label>
      <Title>나에게 맞는 순서</Title>
      <Body muted>답해 주신 자금·시간·기술을 기준으로 다시 매긴 순위예요.</Body>
      {ranked.map((r, i) => {
        const isActive = active.includes(r.method.id);
        return (
          <Pressable
            key={r.method.id}
            accessibilityRole="button"
            disabled={!r.method.available}
            onPress={() => router.push(`/module/${r.method.id}`)}
            style={({ pressed }) => [styles.item, !r.method.available && styles.locked, pressed && { opacity: 0.8 }]}>
            <Text style={styles.rank}>{i + 1}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{r.method.name}</Text>
                {isActive && <Text style={[styles.badge, styles.badgeOn]}>진행 중</Text>}
                {!r.method.available && <Text style={styles.badge}>준비 중</Text>}
              </View>
              <Text style={styles.summary}>{r.method.summary}</Text>
              {r.reasons[0] && <Text style={styles.reason}>{r.reasons[0]}</Text>}
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  locked: { opacity: 0.55 },
  rank: { fontFamily: Fonts.serifEnBold, fontSize: 26, color: Colors.gold, width: 28, textAlign: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontFamily: Fonts.serifKoBold, fontSize: 17, color: Colors.navy },
  badge: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden' },
  badgeOn: { color: Colors.cream, backgroundColor: Colors.navy, borderColor: Colors.navy },
  summary: { fontSize: 14, color: Colors.text },
  reason: { fontSize: 12, color: Colors.textMuted },
});
