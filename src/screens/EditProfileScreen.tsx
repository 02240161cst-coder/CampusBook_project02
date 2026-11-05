import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Icon from '../components/Icon';
import OutlinedInput from '../components/OutlinedInput';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { useColors } from '../theme';
import { pickProfilePhoto } from '../utils/image';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

/** Project II – edit profile information and profile picture. */
export default function EditProfileScreen({ navigation }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, user, role, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.fullName ?? '');
  const [idNo, setIdNo] = useState(profile?.studentId ?? '');
  const [photo, setPhoto] = useState<string | undefined>(profile?.photoBase64);
  const [busy, setBusy] = useState(false);

  const changePhoto = async () => {
    try {
      const p = await pickProfilePhoto();
      if (p) setPhoto(p);
    } catch (e: any) {
      toast(e.message, true);
    }
  };

  const save = async () => {
    if (!name.trim() || !idNo.trim()) {
      toast('Name and ID cannot be empty');
      return;
    }
    setBusy(true);
    try {
      await updateProfile({ fullName: name.trim(), studentId: idNo.trim(), photoBase64: photo ?? '' });
      toast('Profile updated');
      navigation.goBack();
    } catch (e: any) {
      toast(`Update failed: ${e.message}`, true);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.backgroundPage }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Profile" onBack={() => navigation.goBack()} height={56} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingBottom: 24 + insets.bottom }}>
        <View style={{ alignItems: 'center' }}>
          <Pressable onPress={changePhoto}>
            <Avatar photo={photo} size={120} />
            <View
              style={{
                position: 'absolute', right: 0, bottom: 0, width: 36, height: 36, borderRadius: 18,
                backgroundColor: colors.primaryBlue, borderWidth: 3, borderColor: colors.backgroundPage,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="camera" size={18} color={colors.white} />
            </View>
          </Pressable>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <Button title="Change Photo" variant="text" height={40} radius={20} fontSize={14} onPress={changePhoto} />
            {photo ? (
              <Button title="Remove" variant="text" height={40} radius={20} fontSize={14} color={colors.errorRed} onPress={() => setPhoto(undefined)} />
            ) : null}
          </View>
        </View>

        <OutlinedInput label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" style={{ marginTop: 24 }} />
        <OutlinedInput
          label={role === 'Staff' ? 'Staff ID' : 'Student ID'} value={idNo} onChangeText={setIdNo}
          autoCapitalize="none" style={{ marginTop: 16 }}
        />
        <OutlinedInput
          label="Email Address (cannot be changed)" value={profile?.email || user?.email || ''} onChangeText={() => {}}
          editable={false} autoCapitalize="none" style={{ marginTop: 16 }}
        />
        <OutlinedInput
          label="Account Type (cannot be changed)" value={role} onChangeText={() => {}}
          editable={false} style={{ marginTop: 16 }}
        />

        <Text style={{ marginTop: 12, fontSize: 12, color: colors.textSecondary }}>
          Your email and account type are fixed when you register.
        </Text>

        <Button title="Save Changes" height={60} radius={16} fontSize={18} loading={busy} onPress={save} style={{ marginTop: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
