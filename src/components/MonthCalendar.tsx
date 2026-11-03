import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../theme';
import { startOfDay } from '../utils/time';
import Icon from './Icon';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  selected: Date;
  onSelect: (d: Date) => void;
  /** days before this are disabled */
  minDate?: Date;
}

/** Replacement for Android's CalendarView: white month grid, blue selected day. */
export default function MonthCalendar({ selected, onSelect, minDate }: Props) {
  const [view, setView] = useState({ y: selected.getFullYear(), m: selected.getMonth() });
  const today = startOfDay(new Date());
  const min = minDate ? startOfDay(minDate) : null;

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const canGoBack = !min || new Date(view.y, view.m, 1) > new Date(min.getFullYear(), min.getMonth(), 1);

  return (
    <View style={{ backgroundColor: colors.white, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 56 }}>
        <Pressable onPress={() => canGoBack && shift(-1)} hitSlop={8} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: canGoBack ? 1 : 0.3 }}>
          <Icon name="back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
          {MONTHS[view.m]} {view.y}
        </Text>
        <Pressable onPress={() => shift(1)} hitSlop={8} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={22} color={colors.textPrimary} rotate={180} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
        {DOW.map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: colors.textSecondary, paddingVertical: 6 }}>
            {d}
          </Text>
        ))}
      </View>

      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
          {cells.slice(row * 7, row * 7 + 7).map((day, i) => {
            if (!day) return <View key={i} style={{ flex: 1, height: 44 }} />;
            const date = new Date(view.y, view.m, day);
            const disabled = !!min && date < min;
            const isSel = startOfDay(selected).getTime() === date.getTime();
            const isToday = today.getTime() === date.getTime();
            return (
              <Pressable
                key={i}
                disabled={disabled}
                onPress={() => onSelect(date)}
                style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSel ? colors.primaryBlue : 'transparent',
                    borderWidth: isToday && !isSel ? 1 : 0, borderColor: colors.primaryBlue,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSel || isToday ? '700' : '400',
                      color: isSel ? colors.white : disabled ? colors.textMuted : isToday ? colors.primaryBlue : colors.textPrimary,
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
