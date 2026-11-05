import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';
import { useColors } from '../theme';

type Variant = 'filled' | 'outlined' | 'tonal' | 'text';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  height?: number;
  radius?: number;
  fontSize?: number;
  /** text colour (outlined/text) – e.g. error red for "Cancel Booking" */
  color?: string;
  borderColor?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** MaterialButton equivalent (filled / outlined / tonal / text) with no all-caps. */
export default function Button({
  title, onPress, variant = 'filled', height = 56, radius = 16, fontSize = 16,
  color, borderColor, loading, disabled, style, textStyle,
}: Props) {
  const colors = useColors();
  const filled = variant === 'filled';
  const tonal = variant === 'tonal';
  const outlined = variant === 'outlined';
  const txt = color ?? (filled ? colors.white : colors.primaryBlue);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: filled ? 'rgba(255,255,255,0.25)' : 'rgba(59,130,246,0.15)' }}
      style={({ pressed }) => [
        {
          height,
          borderRadius: radius,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          overflow: 'hidden',
          backgroundColor: filled ? colors.primaryBlue : tonal ? colors.lightBlue : 'transparent',
          borderWidth: outlined ? 1 : 0,
          borderColor: borderColor ?? colors.outline,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={filled ? colors.white : colors.primaryBlue} />
      ) : (
        <Text
          style={[
            { color: txt, fontSize, fontWeight: variant === 'text' ? '700' : '500', letterSpacing: 0.1 },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
