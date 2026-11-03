import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { colors, elevation } from '../theme';

interface Props {
  radius?: number;
  elevationDp?: number;
  bg?: string;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/** MaterialCardView equivalent: rounded, clipped, elevated, white. */
export default function Card({
  radius = 16, elevationDp = 2, bg = colors.white, borderColor, style, innerStyle, children,
}: Props) {
  return (
    <View
      style={[
        { backgroundColor: bg, borderRadius: radius },
        borderColor ? { borderWidth: 1, borderColor } : null,
        elevation(elevationDp),
        style,
      ]}
    >
      <View style={[{ borderRadius: radius, overflow: 'hidden' }, innerStyle]}>{children}</View>
    </View>
  );
}
