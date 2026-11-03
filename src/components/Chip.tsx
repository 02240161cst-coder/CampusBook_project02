import React from 'react';
import { Text, View } from 'react-native';
import { colors, elevation } from '../theme';
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
export default function Chip({
  label, bg = colors.secondaryBlue, color = colors.primaryBlue, icon, height = 32, fontSize = 11,
}: Props) {
  return (
    <View
      style={[
        {
          height, borderRadius: 8, backgroundColor: bg, paddingHorizontal: 12,
          flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        },
        elevation(1),
      ]}
    >
      {icon ? (
        <View style={{ marginRight: 6 }}>
          <Icon name={icon} size={18} color={color} />
        </View>
      ) : null}
      <Text style={{ color, fontSize, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}
