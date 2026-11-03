import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '../theme';

/** activity_splash.xml – white screen, 200dp logo (≈45% down), blue bold tagline. */
export default function SplashScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 }}>
      <Image source={require('../../assets/logo.png')} style={{ width: 200, height: 200 }} resizeMode="contain" />
      <Text style={{ marginTop: 24, fontSize: 18, fontWeight: 'bold', color: colors.primaryBlue }}>
        Smart Campus Venue Booking
      </Text>
    </View>
  );
}
