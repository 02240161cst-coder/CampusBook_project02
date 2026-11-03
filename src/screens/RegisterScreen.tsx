import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Icon from '../components/Icon';
import OutlinedInput from '../components/OutlinedInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

/** activity_register.xml + RegisterActivity.registerUser */
export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onRegister = async () => {
    if (!name.trim() || !studentId.trim() || !email.trim() || !password.trim()) {
      toast('Please fill all fields');
      return;
    }
    setBusy(true);
    try {
      await register({ fullName: name.trim(), studentId: studentId.trim(), email: email.trim(), password: password.trim() });
      toast('Registration successful');
    } catch (e: any) {
      toast(`Registration failed: ${e.message}`, true);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.backgroundPage }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, paddingTop: 24 + insets.top, paddingBottom: 24 + insets.bottom }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Icon name="back" size={24} color={colors.primaryBlue} />
          </Pressable>
          <Image source={require('../../assets/logo.png')} style={{ width: 80, height: 80, borderRadius: 8, marginTop: -8 }} resizeMode="contain" />
        </View>

        <Text style={{ marginTop: -8, fontSize: 28, fontWeight: 'bold', color: colors.textPrimary }}>Create Account</Text>

        <OutlinedInput label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" style={{ marginTop: 32 }} />
        <OutlinedInput label="Student/Staff ID" value={studentId} onChangeText={setStudentId} autoCapitalize="none" style={{ marginTop: 16 }} />
        <OutlinedInput
          label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address"
          autoCapitalize="none" style={{ marginTop: 16 }}
        />
        <OutlinedInput label="Password" value={password} onChangeText={setPassword} secure autoCapitalize="none" style={{ marginTop: 16 }} />

        <Button title="Register" height={60} radius={16} fontSize={18} loading={busy} onPress={onRegister} style={{ marginTop: 32 }} />

        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 24, padding: 8, alignSelf: 'center' }}>
          <Text style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Already have an account? Login</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
