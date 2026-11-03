import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { backend } from '../backend';
import Card from '../components/Card';
import Icon from '../components/Icon';
import VenueCard from '../components/VenueCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors } from '../theme';
import { Venue } from '../types';
import { filterVenues } from '../utils/venueUtils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** fragment_home.xml + HomeFragment */
export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const toast = useToast();
  const [all, setAll] = useState<Venue[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.venues
      .list()
      .then(setAll)
      .catch((e) => toast(`Failed to load venues: ${e.message}`))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const venues = useMemo(() => filterVenues(all, query), [all, query]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundPage }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginTop: 32 }}>
        <Image source={require('../../assets/logo.png')} style={{ width: 48, height: 48, borderRadius: 8 }} resizeMode="contain" />
        <Text numberOfLines={1} style={{ flex: 1, marginLeft: 12, fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
          Hello, {profile?.fullName || 'Student'}!
        </Text>
      </View>
      <Text style={{ marginHorizontal: 24, marginTop: 4, fontSize: 14, color: colors.textSecondary }}>
        Where would you like to book today?
      </Text>

      <Card radius={30} elevationDp={2} style={{ height: 60, marginHorizontal: 24, marginTop: 24 }} innerStyle={{ height: 60 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24 }}>
          <Icon name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for venues..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            selectionColor={colors.primaryBlue}
            style={{ flex: 1, marginLeft: 12, fontSize: 15, color: colors.textPrimary, height: 60 }}
          />
        </View>
      </Card>

      <Text style={{ marginLeft: 24, marginTop: 36, fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }}>
        Featured Venues
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primaryBlue} />
      ) : venues.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <View style={{ opacity: 0.5 }}>
            <Icon name="search" size={120} color={colors.textMuted} />
          </View>
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No venues found</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={venues}
          keyExtractor={(v) => v.id}
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <VenueCard venue={item} style={{ width: 280 }} onPress={(venue) => navigation.navigate('VenueDetails', { venue })} />
          )}
        />
      )}
    </ScrollView>
  );
}
