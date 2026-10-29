import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, Label } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { aiConnected, coachReply, describeContext } from '@/lib/ai';
import { todayMission } from '@/lib/escort';
import { useStore } from '@/lib/store';
import type { ChatMessage } from '@/lib/types';

const SUGGESTIONS = ['오늘 뭐 하면 돼?', '막혔어요', '가격은 얼마로 할까?', '세액공제가 뭐야?'];

export default function Coach() {
  const { profile, activeModules, completed, chat, pushChat } = useStore();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const mission = todayMission(activeModules, completed);

  const send = async (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    const userMsg: ChatMessage = { role: 'user', text: q, at: new Date().toISOString() };
    pushChat(userMsg);
    setText('');
    setBusy(true);
    const reply = await coachReply([...chat, userMsg], describeContext(profile, activeModules, mission?.step.title), mission?.step.title);
    pushChat({ role: 'coach', text: reply, at: new Date().toISOString() });
    setBusy(false);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.head}>
          <Label>AI 코치</Label>
          <Text style={styles.title}>막히면 언제든 물어보세요</Text>
          {!aiConnected && <Text style={styles.note}>지금은 기본 코치가 답해요. AI 서버를 연결하면 더 자세히 답해 드려요.</Text>}
        </View>
        <ScrollView ref={scroll} contentContainerStyle={styles.list}>
          {chat.length === 0 && (
            <View style={[styles.bubble, styles.coach]}>
              <Text style={styles.coachText}>
                안녕하세요, 돈길 코치예요. {mission ? `오늘의 미션은 "${mission.step.title}"이에요.` : ''} 무엇이든 물어보세요.
              </Text>
            </View>
          )}
          {chat.map((m, i) => (
            <View key={i} style={[styles.bubble, m.role === 'user' ? styles.user : styles.coach]}>
              <Text style={m.role === 'user' ? styles.userText : styles.coachText}>{m.text}</Text>
            </View>
          ))}
          {busy && <Text style={styles.note}>코치가 답을 쓰고 있어요…</Text>}
        </ScrollView>
        <View style={styles.suggest}>
          {SUGGESTIONS.map((s) => (
            <Chip key={s} label={s} selected={false} onPress={() => send(s)} />
          ))}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            testID="chat-input"
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="질문을 입력하세요"
            placeholderTextColor="#9AA0AC"
            onSubmitEditing={() => send(text)}
            returnKeyType="send"
          />
          <View style={{ width: 80 }}>
            <Button testID="chat-send" title="보내기" onPress={() => send(text)} disabled={!text.trim() || busy} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  head: { paddingHorizontal: 20, paddingTop: 20, gap: 4 },
  title: { fontFamily: Fonts.serifKoBold, fontSize: 20, color: Colors.navy },
  note: { fontSize: 12, color: Colors.textMuted },
  list: { padding: 20, gap: 10 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 14 },
  user: { alignSelf: 'flex-end', backgroundColor: Colors.navy },
  coach: { alignSelf: 'flex-start', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  userText: { color: Colors.cream, fontSize: 15, lineHeight: 21 },
  coachText: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  suggest: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, fontSize: 15, color: Colors.text, backgroundColor: Colors.cream },
});
