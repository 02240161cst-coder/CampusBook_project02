 import React, { useEffect, useState } from 'react';
 import { StatusBar } from 'expo-status-bar';
 import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 import { createNativeStackNavigator } from '@react-navigation/native-stack';
 import { SafeAreaProvider } from 'react-native-safe-area-context';
 
 import { AuthProvider, useAuth } from './src/context/AuthContext';
 import { ToastProvider } from './src/context/ToastContext';
 import TabBar from './src/navigation/TabBar';
 import { RootStackParamList, TabParamList } from './src/navigation/types';
 import { colors } from './src/theme';
 
 import BookingConfirmScreen from './src/screens/BookingConfirmScreen';
 import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
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
 
 const navTheme = {
   ...DefaultTheme,
   colors: { ...DefaultTheme.colors, background: colors.backgroundPage, primary: colors.primaryBlue },
 };
 
 /** MainActivity + bottom_nav_menu: Home · Search · Bookings · Profile */
 function MainTabs() {
   return (
     <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
       <Tab.Screen name="Home" component={HomeScreen} />
       <Tab.Screen name="Explore" component={ExploreScreen} />
       <Tab.Screen name="Bookings" component={MyBookingsScreen} />
       <Tab.Screen name="Profile" component={ProfileScreen} />
     </Tab.Navigator>
   );
 }
 
 function Root() {
   const { loading, user } = useAuth();
   // SplashActivity showed the logo for 1.2 s before checking the login state.
   const [splashDone, setSplashDone] = useState(false);
   useEffect(() => {
     const t = setTimeout(() => setSplashDone(true), 1200);
     return () => clearTimeout(t);
   }, []);
 
   if (loading || !splashDone) return <SplashScreen />;
 
   return (
     <NavigationContainer theme={navTheme}>
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
       <StatusBar style="dark" />
       <ToastProvider>
         <AuthProvider>
           <Root />
         </AuthProvider>
       </ToastProvider>
     </SafeAreaProvider>
   );
 }
 