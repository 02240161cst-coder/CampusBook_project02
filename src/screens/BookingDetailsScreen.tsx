import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { backend } from '../backend';
import Button from '../components/Button';
import Card from '../components/Card';
import OutlinedInput from '../components/OutlinedInput';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { saveBooking } from '../services/bookingService';
import { colors } from '../theme';
import { getVenueImage } from '../utils/venueImages';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetails'>;

/** activity_booking_details.xml + BookingDetailsActivity */
export default function BookingDetailsScreen({ navigation, route }: Props) {
  const p = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const toast = useToast();
  const [purpose, setPurpose] = useState(p.isEdit ? p.purpose ?? '' : '');
  const [attendees, setAttendees] = useState(p.isEdit && p.attendees ? String(p.attendees) : '');
  const [requirements, setRequirements] = useState(p.isEdit ? p.requirements ?? '' : '');
  const [busy, setBusy] = useState(false);
  const img = getVenueImage(p.venue);

  const onConfirm = async () => {
    if (!user) return;
    setBusy(true);
    const res = await saveBooking(backend, {
      userId: user.uid,
      venue: p.venue,
      date: p.date,
      startTime: p.startTime,
      endTime: p.endTime,
      startTimeMinutes: p.startTimeMinutes,
      endTimeMinutes: p.endTimeMinutes,
      attendeesText: attendees,
      purpose,
      requirements,
      editBookingId: p.isEdit ? p.bookingId : null,
    });
    setBusy(false);

    if (!res.ok) {
      toast(res.error, true);
      return;
    }
    if (res.updated) {
      toast('Booking updated successfully');
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Bookings' } }] }),
      );
    } else {
      navigation.replace('BookingConfirm', {
        venueName: p.venue.name,
        date: p.date,
        timeSlot: `${p.startTime} - ${p.endTime}`,
      });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.backgroundPage }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Booking Details" onBack={() => navigation.goBack()} height={56} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
      >
        <Card radius={12} elevationDp={2}>
          {img ? (
            <Image source={img} style={{ width: '100%', height: 180, backgroundColor: colors.photoFrameGrey }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: 180, backgroundColor: colors.photoFrameGrey }} />
          )}
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }}>{p.venue.name}</Text>
            <Text style={{ marginTop: 8, color: colors.textSecondary }}>Date: {p.date}</Text>
            <Text style={{ marginTop: 4, color: colors.textSecondary }}>Time: {p.startTime} - {p.endTime}</Text>
          </View>
        </Card>

        <Text style={{ marginTop: 24, fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>Event Details</Text>

        <OutlinedInput
          label="Purpose of Booking" value={purpose} onChangeText={setPurpose} multiline height={100}
          radius={4} style={{ marginTop: 16 }}
        />
        <OutlinedInput
          label="Number of Attendees" value={attendees} onChangeText={(t) => setAttendees(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad" radius={4} style={{ marginTop: 16 }}
        />
        <OutlinedInput
          label="Additional Requirements" value={requirements} onChangeText={setRequirements} multiline height={120}
          radius={4} style={{ marginTop: 16 }}
        />
      </ScrollView>

      <Button
        title={p.isEdit ? 'Update Booking' : 'Confirm Booking'} height={56} radius={8} loading={busy} onPress={onConfirm}
        style={{ marginHorizontal: 24, marginTop: 8, marginBottom: 24 + Math.max(insets.bottom - 8, 0) }}
      />
    </KeyboardAvoidingView>
  );
}
