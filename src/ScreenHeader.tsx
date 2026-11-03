import React, { useRef, useState } from 'react';
import {
  Animated, KeyboardTypeOptions, Pressable, StyleProp, TextInput, View, ViewStyle,
} from 'react-native';
import { colors, outline } from '../theme';
import Icon, { IconName } from './Icon';

interface Props {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  startIcon?: IconName;
  secure?: boolean; // password with show/hide toggle
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  /** visible height for multiline fields */
  height?: number;
  radius?: number;
  /** colour behind the floating label (must match the screen background) */
  labelBg?: string;
  style?: StyleProp<ViewStyle>;
}

const H = 56;

/**
 * Material "OutlinedBox" text field with a floating label, optional start icon
 * and password toggle – matches the TextInputLayouts in Project I.
 */
export default function OutlinedInput({
  label, value, onChangeText, startIcon, secure, keyboardType, autoCapitalize = 'sentences',
  multiline, height, radius = 16, labelBg = colors.backgroundPage, style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  const floated = focused || value.length > 0;
  const anim = useRef(new Animated.Value(floated ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, { toValue: floated ? 1 : 0, duration: 150, useNativeDriver: false }).start();
  }, [floated, anim]);

  const boxH = multiline ? height ?? 100 : H;
  const restTop = multiline ? 16 : (H - 20) / 2;
  const restLeft = startIcon ? 52 : 16;

  const labelStyle = {
    position: 'absolute' as const,
    left: anim.interpolate({ inputRange: [0, 1], outputRange: [restLeft, 12] }),
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [restTop, -9] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: focused ? colors.primaryBlue : colors.textSecondary,
    backgroundColor: floated ? labelBg : 'transparent',
    paddingHorizontal: floated ? 4 : 0,
    zIndex: 3,
  };

  return (
    <View style={[{ height: boxH }, style]}>
      {/* border is an overlay so focus (1dp → 2dp) never shifts the layout */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius,
          borderWidth: focused ? 2 : 1, borderColor: focused ? colors.primaryBlue : outline, zIndex: 1,
        }}
      />
      {startIcon ? (
        <View style={{ position: 'absolute', left: 14, top: multiline ? 16 : (H - 24) / 2, zIndex: 2 }}>
          <Icon name={startIcon} size={24} color={focused ? colors.primaryBlue : colors.textSecondary} />
        </View>
      ) : null}
      <Animated.Text pointerEvents="none" numberOfLines={1} style={labelStyle}>
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={!!secure && hidden}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        selectionColor={colors.primaryBlue}
        style={{
          flex: 1,
          fontSize: 16,
          color: colors.textPrimary,
          paddingLeft: restLeft,
          paddingRight: secure ? 52 : 16,
          paddingTop: multiline ? 18 : 0,
          paddingBottom: multiline ? 12 : 0,
        }}
      />
      {secure ? (
        <Pressable
          onPress={() => setHidden((h) => !h)}
          hitSlop={8}
          style={{ position: 'absolute', right: 4, top: 4, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 4 }}
        >
          <Icon name={hidden ? 'eye' : 'eyeOff'} size={24} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}
