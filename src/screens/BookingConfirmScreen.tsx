import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirm'>;

/** activity_booking_confirm.xml + BookingConfirmActivity */
export default function BookingConfirmScreen({ navigation, route }: Props) {
  const { venueName, date, timeSlot } = route.params;

  const goMain = (screen: 'Home' | 'Bookings') =>
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main', params: { screen } }] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.white, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
      {/* bg_success_glow.xml: radial green glow behind the check mark */}
      <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={140} height={140} style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="glow" cx="70" cy="70" r="70" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#10B981" stopOpacity={0.376} />
              <Stop offset="0.5" stopColor="#10B981" stopOpacity={0.125} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="70" cy="70" r="70" fill="url(#glow)" />
        </Svg>
        <Icon name="check" size={76} color={colors.successGreen} />
      </View>

      <Text style={{ marginTop: 24, fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>Booking Successful!</Text>
      <Text style={{ marginTop: 12, fontSize: 16, textAlign: 'center', color: colors.textSecondary }}>
        Your request for {venueName} has been successfully reserved.
      </Text>

      <Card radius={12} elevationDp={0} borderColor={colors.dividerGrey} style={{ alignSelf: 'stretch', marginTop: 32 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textPrimary }}>Venue: {venueName}</Text>
          <Text style={{ marginTop: 4, color: colors.textPrimary }}>Date: {date}</Text>
          <Text style={{ marginTop: 4, color: colors.textPrimary }}>Time: {timeSlot}</Text>
        </View>
      </Card>

      <Button title="View My Bookings" height={56} radius={8} style={{ alignSelf: 'stretch', marginTop: 32 }} onPress={() => goMain('Bookings')} />
      <Button title="Back to Home" variant="outlined" height={56} radius={8} style={{ alignSelf: 'stretch', marginTop: 16 }} onPress={() => goMain('Home')} />
    </View>
  );
}
