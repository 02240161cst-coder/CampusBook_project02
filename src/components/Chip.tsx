import React from 'react';
import { Text, View } from 'react-native';
import { elevation, useColors } from '../theme';
import Icon, { IconName } from './Icon';

interface Props {
  label: string;
  bg?: string;
  color?: string;
  icon?: IconName;
  height?: number;
  fontSize?: number;
}

/** Widget.Material3.Chip.Assist.Elevated look: 8dp corners, soft elevation. */
export default function Chip({ label, bg, color, icon, height = 32, fontSize = 11 }: Props) {
  const colors = useColors();
  const background = bg ?? colors.secondaryBlue;
  const fg = color ?? colors.primaryBlue;
  return (
    <View
      style={[
        {
          height, borderRadius: 8, backgroundColor: background, paddingHorizontal: 12,
          flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        },
        elevation(1),
      ]}
    >
      {icon ? (
        <View style={{ marginRight: 6 }}>
          <Icon name={icon} size={18} color={fg} />
        </View>
      ) : null}
      <Text style={{ color: fg, fontSize, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}
