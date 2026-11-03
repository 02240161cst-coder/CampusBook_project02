import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
import Icon from '../components/Icon';
import MonthCalendar from '../components/MonthCalendar';
import ScreenHeader from '../components/ScreenHeader';
import TimePicker from '../components/TimePicker';
import { useToast } from '../context/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { HM, validateTimeRange } from '../utils/bookingLogic';
import { formatDate, formatTime } from '../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectDate'>;

/** activity_select_date.xml + SelectDateActivity */
export default function SelectDateScreen({ navigation, route }: Props) {
  const { venue, bookingId, isEdit, purpose, attendees, requirements } = route.params;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [date, setDate] = useState(new Date());
  const [start, setStart] = useState<HM | null>(null);
  const [end, setEnd] = useState<HM | null>(null);
  const [picking, setPicking] = useState<'start' | 'end' | null>(null);

  const onContinue = () => {
    const err = validateTimeRange(start, end);
    if (err || !start || !end) {
      toast(err ?? 'Please select both start and end time');
      return;
    }
    navigation.navigate('BookingDetails', {
      venue,
      date: formatDate(date),
      startTime: formatTime(start.hour, start.minute),
      endTime: formatTime(end.hour, end.minute),
      startTimeMinutes: start.hour * 60 + start.minute,
      endTimeMinutes: end.hour * 60 + end.minute,
      bookingId, isEdit, purpose, attendees, requirements,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPage }}>
      <ScreenHeader title="Select Date & Time" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Card radius={12} elevationDp={2} style={{ margin: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ width: 40, height: 40, backgroundColor: colors.secondaryBlue, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bookings" size={24} color={colors.primaryBlue} />
            </View>
            <Text numberOfLines={1} style={{ flex: 1, marginLeft: 16, fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>
              {venue.name}
            </Text>
          </View>
        </Card>

        <Text style={{ marginLeft: 24, marginTop: 0, fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>Select Date</Text>
        <View style={{ marginTop: 8 }}>
          <MonthCalendar selected={date} onSelect={setDate} minDate={new Date()} />
        </View>

        <Text style={{ marginLeft: 24, marginTop: 24, fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>Select Time Range</Text>
        <View style={{ flexDirection: 'row', marginHorizontal: 24, marginTop: 16 }}>
          <Button
            variant="outlined" height={56} radius={12} fontSize={14} style={{ flex: 1, marginRight: 8 }}
            title={start ? formatTime(start.hour, start.minute) : 'Start Time'} onPress={() => setPicking('start')}
          />
          <Button
            variant="outlined" height={56} radius={12} fontSize={14} style={{ flex: 1, marginLeft: 8 }}
            title={end ? formatTime(end.hour, end.minute) : 'End Time'} onPress={() => setPicking('end')}
          />
        </View>
        <Text style={{ marginTop: 16, textAlign: 'center', fontWeight: 'bold', color: colors.primaryBlue }}>
          {start && end
            ? `${formatTime(start.hour, start.minute)} - ${formatTime(end.hour, end.minute)}`
            : 'No time range selected'}
        </Text>
      </ScrollView>

      <Button
        title="Continue" height={64} radius={16} fontSize={16}
        style={{ marginHorizontal: 24, marginBottom: 24 + Math.max(insets.bottom - 8, 0) }}
        onPress={onContinue}
      />

      <TimePicker
        visible={picking !== null}
        hour={picking === 'start' ? start?.hour ?? 9 : end?.hour ?? 10}
        minute={picking === 'start' ? start?.minute ?? 0 : end?.minute ?? 0}
        onCancel={() => setPicking(null)}
        onConfirm={(hour, minute) => {
          if (picking === 'start') setStart({ hour, minute });
          else setEnd({ hour, minute });
          setPicking(null);
        }}
      />
    </View>
  );
}
