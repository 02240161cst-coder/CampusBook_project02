import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { backend } from '../backend';
import Button from '../components/Button';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import { useToast } from '../context/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { Booking } from '../types';
import { shortBookingId } from '../utils/bookingLogic';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageBooking'>;

/** activity_manage_booking.xml + ManageBookingActivity */
export default function ManageBookingScreen({ navigation, route }: Props) {
  const { bookingId } = route.params;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      backend.bookings
        .get(bookingId)
        .then((b) => {
          if (!b) {
            toast('Booking not found');
            navigation.goBack();
          } else setBooking(b);
        })
        .catch((e) => toast(`Error: ${e.message}`))
        .finally(() => setLoading(false));
    }, [bookingId]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onEdit = async () => {
    if (!booking) return;
    try {
      const venues = await backend.venues.list();
      const venue = venues.find((v) => v.name === booking.venueName);
      if (!venue) {
        toast('Venue not found');
        return;
      }
      navigation.navigate('SelectDate', {
        venue,
        bookingId: booking.id,
        isEdit: true,
        purpose: booking.purpose,
        attendees: booking.attendees,
        requirements: booking.requirements,
      });
    } catch (e: any) {
      toast(`Error: ${e.message}`);
    }
  };

  const doCancel = async () => {
    try {
      await backend.bookings.remove(bookingId);
      toast('Booking cancelled successfully');
      navigation.goBack();
    } catch (e: any) {
      toast(`Failed to cancel: ${e.message}`);
    }
  };

  const onCancel = () =>
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking? This action cannot be undone.', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: doCancel },
    ]);

  const time = booking && booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPage }}>
      <ScreenHeader title="Manage Booking" onBack={() => navigation.goBack()} height={56} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primaryBlue} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Card radius={12} elevationDp={2} style={{ margin: 24 }}>
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }}>{booking?.venueName}</Text>
              <Text style={{ marginTop: 12, color: colors.textSecondary }}>Booking ID: {shortBookingId(bookingId)}</Text>
              <View style={{ height: 1, marginVertical: 16, backgroundColor: colors.dividerGrey }} />
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>Date & Time</Text>
              <Text style={{ marginTop: 4, color: colors.textSecondary }}>{booking?.bookingDate} | {time}</Text>
              <Text style={{ marginTop: 16, fontWeight: 'bold', color: colors.textPrimary }}>Purpose</Text>
              <Text style={{ marginTop: 4, color: colors.textSecondary }}>{booking?.purpose}</Text>
            </View>
          </Card>
        </ScrollView>
      )}

      <Button title="Edit Booking Details" height={56} radius={8} style={{ marginHorizontal: 24, marginBottom: 16 }} onPress={onEdit} />
      <Button
        title="Cancel Booking" variant="outlined" height={56} radius={8} color={colors.errorRed} borderColor={colors.errorRed}
        style={{ marginHorizontal: 24, marginBottom: 24 + Math.max(insets.bottom - 8, 0) }} onPress={onCancel}
      />
    </View>
  );
}
