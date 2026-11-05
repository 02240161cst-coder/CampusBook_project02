import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { backend } from '../backend';
import BookingCard from '../components/BookingCard';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { syncReminders } from '../services/notificationService';
import { useColors } from '../theme';
import { Booking } from '../types';
import { filterBookingsByTab } from '../utils/bookingLogic';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Bookings'>,
  NativeStackScreenProps<RootStackParamList>
>;

function TabLabel({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useColors();
  const [w, setW] = useState(0);
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', height: 48, justifyContent: 'center' }}>
      <Text
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        style={{ fontSize: 14, fontWeight: '500', color: active ? colors.primaryBlue : colors.textSecondary }}
      >
        {label}
      </Text>
      {/* tabIndicatorFullWidth=false → indicator as wide as the label */}
      {active ? (
        <View
          style={{
            position: 'absolute', bottom: 0, height: 3, width: w, backgroundColor: colors.primaryBlue,
            borderTopLeftRadius: 3, borderTopRightRadius: 3,
          }}
        />
      ) : null}
    </Pressable>
  );
}

/** fragment_my_bookings.xml + MyBookingsFragment (Upcoming / Past tabs) */
export default function MyBookingsScreen({ navigation }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<0 | 1>(0);
  const [all, setAll] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload every time the tab gains focus (Project I used onResume).
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      backend.bookings
        .listByUser(user.uid)
        .then((list) => {
          setAll(list);
          syncReminders(list).catch(() => {}); // make sure upcoming bookings have reminders
        })
        .catch((e) => toast(`Error: ${e.message}`))
        .finally(() => setLoading(false));
    }, [user]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const data = useMemo(() => filterBookingsByTab(all, tab), [all, tab]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPage, paddingTop: insets.top }}>
      <Text style={{ marginLeft: 24, marginTop: 32, fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
        My Bookings
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 16, borderBottomWidth: 1, borderBottomColor: colors.dividerGrey }}>
        <TabLabel label="Upcoming" active={tab === 0} onPress={() => setTab(0)} />
        <TabLabel label="Past" active={tab === 1} onPress={() => setTab(1)} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primaryBlue} />
      ) : data.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
          <View style={{ opacity: 0.4 }}>
            <Icon name="bookings" size={100} color={colors.textMuted} />
          </View>
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(b) => b.id}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <BookingCard booking={item} onManage={(b) => navigation.navigate('ManageBooking', { bookingId: b.id })} />
          )}
        />
      )}
    </View>
  );
}
