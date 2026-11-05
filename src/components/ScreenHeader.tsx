import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../theme';
import Icon from './Icon';

interface Props {
  title: string;
  onBack: () => void;
  height?: number;
}

/** Back arrow on the left + centred 20sp bold title (Select Date, Booking Details, Manage, Settings). */
export default function ScreenHeader({ title, onBack, height = 64 }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.backgroundPage }}>
      <View style={{ height, justifyContent: 'center' }}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={{ position: 'absolute', left: 8, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
        >
          <Icon name="back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }}>
          {title}
        </Text>
      </View>
    </View>
  );
}
