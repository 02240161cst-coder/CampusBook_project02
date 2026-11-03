import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import OutlinedInput from '../components/OutlinedInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/** activity_login.xml + LoginActivity.loginUser */
export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast('Please fill all fields');
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password.trim());
      // AuthContext switches to the app stack automatically.
    } catch (e: any) {
      toast(`Login failed: ${e.message}`);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.backgroundPage }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 24 + insets.top, paddingBottom: 24 + insets.bottom,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 160, height: 160, borderRadius: 16 }}
            resizeMode="contain"
          />
          <Text style={{ marginTop: 24, fontSize: 30, fontWeight: 'bold', color: colors.textPrimary }}>Welcome Back</Text>
          <Text style={{ marginTop: 8, fontSize: 16, color: colors.textSecondary }}>Sign in to your campus account</Text>
        </View>

        <OutlinedInput
          label="Email Address" value={email} onChangeText={setEmail} startIcon="profile"
          keyboardType="email-address" autoCapitalize="none" style={{ marginTop: 40 }}
        />
        <OutlinedInput
          label="Password" value={password} onChangeText={setPassword} startIcon="settings"
          secure autoCapitalize="none" style={{ marginTop: 16 }}
        />

        <Button title="Login" height={60} radius={16} fontSize={18} loading={busy} onPress={onLogin} style={{ marginTop: 32 }} />

        <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 24, padding: 8, alignSelf: 'center' }}>
          <Text style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Don't have an account? Register</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
