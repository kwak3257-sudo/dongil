import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Radius } from '@/constants/theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Label({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.label, muted && { color: Colors.textMuted }]}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  return <Text style={[styles.body, muted && { color: Colors.textMuted }, style]}>{children}</Text>;
}

export function Card({ children, style, accent }: { children: ReactNode; style?: ViewStyle; accent?: boolean }) {
  return <View style={[styles.card, accent && styles.cardAccent, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  kind = 'primary',
  disabled,
  testID,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'light';
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        kind === 'primary' && styles.btnPrimary,
        kind === 'secondary' && styles.btnSecondary,
        kind === 'ghost' && styles.btnGhost,
        kind === 'light' && styles.btnLight,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
      ]}>
      <Text style={[styles.btnText, (kind === 'secondary' || kind === 'ghost') && { color: Colors.navy }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.chipText, selected && { color: Colors.cream }]}>{label}</Text>
    </Pressable>
  );
}

export function Progress({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: value }}>
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor="#9AA0AC" style={[styles.input, style]} {...rest} />
    </View>
  );
}

// 숫자 입력: 쉼표·공백을 지우고 숫자로
export const toNumber = (s: string) => Number(s.replace(/[^0-9.]/g, '')) || 0;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 20, paddingBottom: 48, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontFamily: Fonts.serifKoBold, fontSize: 22, color: Colors.navy },
  label: { fontSize: 13, fontWeight: '700', color: Colors.gold, letterSpacing: 0.5 },
  body: { fontSize: 15, lineHeight: 22, color: Colors.text },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  cardAccent: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  btn: { borderRadius: Radius.md, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  btnPrimary: { backgroundColor: Colors.navy },
  btnSecondary: { backgroundColor: Colors.goldSoft },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  btnLight: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.goldSoft },
  btnText: { color: Colors.cream, fontSize: 15, fontWeight: '700' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  chipOn: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  chipText: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  track: { height: 8, borderRadius: 4, backgroundColor: '#EAE4D6', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: Colors.gold },
  fieldLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Colors.text },
});
