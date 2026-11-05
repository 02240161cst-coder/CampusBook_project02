import React from 'react';
import { Image, View } from 'react-native';
import { useColors } from '../theme';
import Icon from './Icon';

interface Props {
  /** data-URI (or URL) of the profile picture; falls back to the Project I person icon */
  photo?: string;
  size?: number;
}

/** Round profile picture with the white ring used on the Project I profile screen. */
export default function Avatar({ photo, size = 120 }: Props) {
  const colors = useColors();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor: colors.surface,
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        backgroundColor: photo ? colors.photoFrameGrey : 'transparent',
      }}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Icon name="profile" size={size * 0.9} color={colors.textPrimary} />
      )}
    </View>
  );
}
