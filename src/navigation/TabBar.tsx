import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { IconName } from '../components/Icon';
import { elevation, useColors } from '../theme';

const ITEMS: Record<string, { label: string; icon: IconName }> = {
  Home: { label: 'Home', icon: 'home' },
  Explore: { label: 'Search', icon: 'search' },
  Calendar: { label: 'Calendar', icon: 'calendar' },
  Bookings: { label: 'Bookings', icon: 'bookings' },
  Profile: { label: 'Profile', icon: 'profile' },
};

/** Material 3 BottomNavigationView look: white bar, pill indicator, 4 labelled items. */
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flexDirection: 'row', backgroundColor: colors.surface, paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
        },
        elevation(8),
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const item = ITEMS[route.name];
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name as never);
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                backgroundColor: focused ? colors.lightBlue : 'transparent',
              }}
            >
              <Icon name={item.icon} size={24} color={focused ? colors.primaryBlue : colors.textSecondary} />
            </View>
            <Text
              style={{
                marginTop: 4, fontSize: 12, fontWeight: focused ? '700' : '500',
                color: focused ? colors.primaryBlue : colors.textSecondary,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
