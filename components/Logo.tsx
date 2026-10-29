import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

interface Props {
  size?: number; // DONGIL 글자 크기
  onDark?: boolean;
  tagline?: boolean;
}

// 'DONGIL 돈길' 세리프 워드마크: 영문 대문자 + 금색 가는 선 + 한글
export function Logo({ size = 28, onDark = false, tagline = false }: Props) {
  const ink = onDark ? Colors.cream : Colors.navy;
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="DONGIL 돈길">
      <Text style={[styles.en, { fontSize: size, color: ink, letterSpacing: size * 0.18 }]}>DONGIL</Text>
      <View style={[styles.rule, { height: size * 0.8 }]} />
      <View>
        <Text style={[styles.ko, { fontSize: size * 0.62 }]}>돈길</Text>
        {tagline && <Text style={[styles.tag, { color: onDark ? Colors.goldSoft : Colors.textMuted }]}>The Money Path</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  en: { fontFamily: Fonts.serifEnBold },
  rule: { width: 1.5, backgroundColor: Colors.gold, marginHorizontal: 10 },
  ko: { fontFamily: Fonts.serifKoBold, color: Colors.gold },
  tag: { fontFamily: Fonts.serifEn, fontSize: 11, letterSpacing: 1.2, marginTop: -2 },
});
