import { Platform, ViewStyle } from 'react-native';
export { colors, outline } from './colors';

/** Corner radii from themes.xml (ShapeAppearance.CampusBook.*) */
export const radius = { small: 8, medium: 12, large: 16 };

/**
 * Approximates Android `cardElevation` on both platforms.
 * Android uses native elevation; iOS uses a shadow.
 */
export function elevation(n: number): ViewStyle {
  if (n <= 0) return {};
  return Platform.select<ViewStyle>({
    android: { elevation: n },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.06 + n * 0.015,
      shadowRadius: n * 1.6,
      shadowOffset: { width: 0, height: n * 0.6 },
    },
  }) as ViewStyle;
}
