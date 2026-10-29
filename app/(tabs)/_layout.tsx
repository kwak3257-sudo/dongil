import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { ComponentProps } from 'react';

import { Colors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={typeof color === 'string' ? color : undefined} size={size} />;
  };

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.navy,
        tabBarInactiveTintColor: '#9AA0AC',
        tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.border },
      }}>
      <Tabs.Screen name="index" options={{ title: '오늘', tabBarIcon: icon('sunny-outline') }} />
      <Tabs.Screen name="modules" options={{ title: '돈길 지도', tabBarIcon: icon('map-outline') }} />
      <Tabs.Screen name="records" options={{ title: '기록', tabBarIcon: icon('wallet-outline') }} />
      <Tabs.Screen name="coach" options={{ title: '코치', tabBarIcon: icon('chatbubbles-outline') }} />
      <Tabs.Screen name="profile" options={{ title: '내 정보', tabBarIcon: icon('person-outline') }} />
    </Tabs>
  );
}
