import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useColors } from '../theme';
import { UserType } from '../types';

interface Props {
  value: UserType;
  onChange: (v: UserType) => void;
  style?: StyleProp<ViewStyle>;
}

const OPTIONS: UserType[] = ['Student', 'Staff'];

/** Student | Staff switch used on the Login and Register screens. */
export default function RoleSelector({ value, onChange, style }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          flexDirection: 'row', height: 48, borderRadius: 12, padding: 4,
          backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.dividerGrey,
        },
        style,
      ]}
    >
      {OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
              backgroundColor: active ? colors.primaryBlue : 'transparent',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: active ? '700' : '500', color: active ? colors.white : colors.textSecondary }}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
