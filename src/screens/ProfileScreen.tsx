import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { useColors } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** fragment_profile.xml + ProfileFragment  (+ Project II: photo, role, Edit Profile) */
export default function ProfileScreen({ navigation }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, user, role, signOut } = useAuth();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundPage }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}
    >
      {/* settings button – top right */}
      <Pressable
        onPress={() => navigation.navigate('Settings')}
        style={{
          alignSelf: 'flex-end', marginTop: 24, marginRight: 24, width: 48, height: 48, borderRadius: 8,
          borderWidth: 1, borderColor: colors.dividerGrey, alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name="settings" size={24} color={colors.textPrimary} />
      </Pressable>

      <View style={{ alignItems: 'center', marginTop: -8 }}>
        <Avatar photo={profile?.photoBase64} size={120} />
        <Text style={{ marginTop: 20, fontSize: 26, fontWeight: 'bold', color: colors.textPrimary }}>
          {profile?.fullName || 'User Name'}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          <View style={{ backgroundColor: colors.secondaryBlue, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.primaryBlue }}>ID: {profile?.studentId ?? ''}</Text>
          </View>
          <View style={{ backgroundColor: colors.secondaryBlue, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.primaryBlue }}>{role}</Text>
          </View>
        </View>
      </View>

      <Text style={{ marginLeft: 24, marginTop: 40, fontSize: 12, fontWeight: 'bold', color: colors.textSecondary }}>
        ACCOUNT INFORMATION
      </Text>
      <Card radius={16} elevationDp={1} style={{ marginHorizontal: 24, marginTop: 12 }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>Email Address</Text>
          <Text style={{ marginTop: 4, fontSize: 15, fontWeight: 'bold', color: colors.textPrimary }}>
            {profile?.email || user?.email || 'user@example.com'}
          </Text>
          <View style={{ height: 1, marginVertical: 14, backgroundColor: colors.dividerGrey }} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>Account Type</Text>
          <Text style={{ marginTop: 4, fontSize: 15, fontWeight: 'bold', color: colors.textPrimary }}>{role}</Text>
        </View>
      </Card>

      <Card radius={16} elevationDp={2} style={{ marginHorizontal: 24, marginTop: 24 }}>
        <Pressable
          android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          onPress={() => navigation.navigate('EditProfile')}
          style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}
        >
          <Icon name="profile" size={24} color={colors.primaryBlue} />
          <Text style={{ flex: 1, marginLeft: 16, fontSize: 16, color: colors.textPrimary }}>Edit Profile</Text>
          <Icon name="back" size={20} color={colors.textMuted} rotate={180} />
        </Pressable>
        <View style={{ height: 1, backgroundColor: colors.dividerGrey }} />
        <Pressable
          android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          onPress={() => signOut()}
          style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}
        >
          <Icon name="back" size={24} color={colors.errorRed} />
          <Text style={{ flex: 1, marginLeft: 16, fontSize: 16, fontWeight: 'bold', color: colors.errorRed }}>Log Out</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}
