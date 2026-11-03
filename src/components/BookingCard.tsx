import React from 'react';
import { Text, View } from 'react-native';
import { Booking } from '../types';
import { colors } from '../theme';
import Button from './Button';
import Card from './Card';
import Icon from './Icon';

interface Props {
  booking: Booking;
  onManage: (b: Booking) => void;
}

/** item_booking.xml */
export default function BookingCard({ booking, onManage }: Props) {
  const time = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : '';
  return (
    <Card style={{ marginHorizontal: 16, marginVertical: 8 }} radius={16} elevationDp={2}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>{booking.venueName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Icon name="calendar" size={16} color={colors.textSecondary} />
          <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textSecondary }}>
            {booking.bookingDate} | {time}
          </Text>
        </View>
        <Button
          title="Manage Booking" variant="text" height={40} radius={20} fontSize={14}
          style={{ marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 12, marginLeft: -12 }}
          onPress={() => onManage(booking)}
        />
      </View>
    </Card>
  );
}
