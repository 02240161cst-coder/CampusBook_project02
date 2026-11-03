import React, { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

/** activity_settings.xml + SettingsActivity (visual only in Project I) */
export default function SettingsScreen({ navigation }: Props) {
  const [notif, setNotif] = useState(true);
  const row = { paddingVertical: 12, color: colors.textPrimary, fontSize: 14 } as const;
  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPage }}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} height={56} />
      <Card radius={16} elevationDp={2} style={{ margin: 24 }}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: colors.textPrimary }}>Notifications</Text>
            <Switch
              value={notif}
              onValueChange={setNotif}
              trackColor={{ false: colors.dividerGrey, true: colors.primaryBlue }}
              thumbColor={colors.white}
            />
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
