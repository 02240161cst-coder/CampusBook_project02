import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import TabBar from './src/navigation/TabBar';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { ensurePermission, initNotifications } from './src/services/notificationService';
import { ThemeProvider, useTheme } from './src/theme';

import BookingConfirmScreen from './src/screens/BookingConfirmScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ManageBookingScreen from './src/screens/ManageBookingScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SelectDateScreen from './src/screens/SelectDateScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplashScreen from './src/screens/SplashScreen';
import VenueDetailsScreen from './src/screens/VenueDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

/** Home · Search · Calendar · Bookings · Profile */
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { loading, user } = useAuth();
  const { colors, isDark } = useTheme();
  // SplashActivity showed the logo for 1.2 s before checking the login state.
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Project II: notification channel/handler once, permission once the user is signed in
  useEffect(() => {
    initNotifications().catch(() => {});
  }, []);
  useEffect(() => {
    if (user) ensurePermission().catch(() => {});
  }, [user]);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.backgroundPage,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.dividerGrey,
        primary: colors.primaryBlue,
      },
    };
  }, [isDark, colors]);

  if (loading || !splashDone) return <SplashScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
            <Stack.Screen name="SelectDate" component={SelectDateScreen} />
            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="ManageBooking" component={ManageBookingScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Root />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
