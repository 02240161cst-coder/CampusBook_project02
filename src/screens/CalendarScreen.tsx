import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { backend } from '../backend';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Icon from '../components/Icon';
import MonthCalendar from '../components/MonthCalendar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { useColors } from '../theme';
import { Booking, Venue } from '../types';
import { formatDate, formatLongDate } from '../utils/time';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Calendar'>,
  NativeStackScreenProps<RootStackParamList>
>;

/**
 * Project II – calendar-based booking view.
 * Pick a date → see every venue that is already booked that day, with its time slot.
 * Dots under the dates show which days have bookings.
 */
export default function CalendarScreen({ navigation }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const toast = useToast();
  const [selected, setSelected] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  // reload whenever the tab gains focus so new/cancelled bookings show up
  useFocusEffect(
    useCallback(() => {
      Promise.all([backend.bookings.listAll(), backend.venues.list()])
        .then(([b, v]) => {
          setBookings(b);
          setVenues(v);
        })
        .catch((e) => toast(`Error loading calendar: ${e.message}`))
        .finally(() => setLoading(false));
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const marked = useMemo(() => new Set(bookings.map((b) => b.bookingDate)), [bookings]);
  const dayKey = formatDate(selected);
  const dayBookings = useMemo(
    () => bookings.filter((b) => b.bookingDate === dayKey).sort((a, b) => a.startTimeMinutes - b.startTimeMinutes),
    [bookings, dayKey],
  );

  const openVenue = (b: Booking) => {
    const venue = venues.find((v) => v.name === b.venueName);
    if (venue) navigation.navigate('VenueDetails', { venue });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundPage }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 32 }}
    >
      <Text style={{ marginLeft: 24, marginTop: 32, fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
        Booking Calendar
      </Text>
      <Text style={{ marginHorizontal: 24, marginTop: 4, fontSize: 14, color: colors.textSecondary }}>
        Select a date to see which venues are booked.
      </Text>

      <Card radius={16} elevationDp={2} style={{ marginHorizontal: 24, marginTop: 20 }}>
        <MonthCalendar selected={selected} onSelect={setSelected} markedDates={marked} />
      </Card>

      <Text style={{ marginLeft: 24, marginTop: 28, fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>
        Booked on {formatLongDate(selected)}
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primaryBlue} />
      ) : dayBookings.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <View style={{ opacity: 0.4 }}>
            <Icon name="calendar" size={80} color={colors.textMuted} />
          </View>
          <Text style={{ marginTop: 12, fontSize: 16, color: colors.textSecondary }}>No venues are booked on this date</Text>
        </View>
      ) : (
        dayBookings.map((b) => {
          const mine = b.userId === user?.uid;
          return (
            <Card key={b.id} radius={16} elevationDp={2} style={{ marginHorizontal: 24, marginTop: 12 }}>
              <Pressable onPress={() => openVenue(b)} android_ripple={{ color: 'rgba(0,0,0,0.06)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                  <View
                    style={{
                      width: 44, height: 44, borderRadius: 12, backgroundColor: colors.secondaryBlue,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon name="time" size={24} color={colors.primaryBlue} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>
                      {b.venueName}
                    </Text>
                    <Text style={{ marginTop: 4, fontSize: 14, color: colors.textSecondary }}>
                      {b.startTime} - {b.endTime}
                    </Text>
                  </View>
                  {mine ? <Chip label="Your booking" height={28} /> : null}
                </View>
              </Pressable>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}
