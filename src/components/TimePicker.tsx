import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors } from '../theme';
import Button from './Button';

interface Props {
  visible: boolean;
  hour: number;
  minute: number;
  onConfirm: (hour: number, minute: number) => void;
  onCancel: () => void;
}

const make = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

/**
 * Android → native TimePickerDialog (12-hour, like Project I).
 * iOS     → spinner in a bottom sheet with a Done button.
 */
export default function TimePicker({ visible, hour, minute, onConfirm, onCancel }: Props) {
  const [val, setVal] = useState(make(hour, minute));

  useEffect(() => {
    if (!visible) return;
    setVal(make(hour, minute));
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: make(hour, minute),
        mode: 'time',
        is24Hour: false,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onConfirm(date.getHours(), date.getMinutes());
          else onCancel();
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (Platform.OS === 'android') return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onCancel} />
      <View style={{ backgroundColor: colors.white, paddingBottom: 32, paddingHorizontal: 24, paddingTop: 8 }}>
        <DateTimePicker
          value={val}
          mode="time"
          display="spinner"
          is24Hour={false}
          onChange={(_, d) => d && setVal(d)}
          textColor={colors.textPrimary}
        />
        <Button title="Done" height={52} radius={16} onPress={() => onConfirm(val.getHours(), val.getMinutes())} />
        <Text style={{ height: 0 }} />
      </View>
    </Modal>
  );
}
