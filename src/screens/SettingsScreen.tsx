import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import { useToast } from '../context/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { isEnabled, setEnabled } from '../services/notificationService';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

/** activity_settings.xml + SettingsActivity  (+ Project II: working dark theme & notification switches) */
export default function SettingsScreen({ navigation }: Props) {
  const { colors, isDark, setMode } = useTheme();
  const toast = useToast();
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    isEnabled().then(setNotif).catch(() => {});
  }, []);

  const toggleNotifications = async (on: boolean) => {
    setNotif(on);
    try {
      const ok = await setEnabled(on);
      if (on && !ok) {
        setNotif(false);
        await setEnabled(false);
        toast('Notifications are blocked. Enable them in your phone settings.', true);
      }
    } catch {
      toast('Could not change notification setting');
    }
  };

  const row = { paddingVertical: 12, color: colors.textPrimary, fontSize: 14 } as const;
  const switchProps = {
    trackColor: { false: colors.dividerGrey, true: colors.primaryBlue },
    thumbColor: colors.white,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPage }}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} height={56} />
      <Card radius={16} elevationDp={2} style={{ margin: 24 }}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textPrimary }}>Notifications</Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: colors.textSecondary }}>
                Booking confirmations, changes and reminders
              </Text>
            </View>
            <Switch value={notif} onValueChange={toggleNotifications} {...switchProps} />
          </View>

          <View style={{ height: 1, marginVertical: 16, backgroundColor: colors.dividerGrey }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textPrimary }}>Dark Mode</Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: colors.textSecondary }}>Switch between light and dark theme</Text>
            </View>
            <Switch value={isDark} onValueChange={(v) => setMode(v ? 'dark' : 'light')} {...switchProps} />
          </View>

          <View style={{ height: 1, marginVertical: 16, backgroundColor: colors.dividerGrey }} />

          <Text style={row}>Privacy Policy</Text>
          <Text style={row}>Terms of Service</Text>
          <Text style={row}>About CampusBook</Text>
        </View>
      </Card>
    </View>
  );
}
