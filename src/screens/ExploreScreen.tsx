import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { backend } from '../backend';
import OutlinedInput from '../components/OutlinedInput';
import VenueCard from '../components/VenueCard';
import { useToast } from '../context/ToastContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { useColors } from '../theme';
import { Venue } from '../types';
import { filterVenues } from '../utils/venueUtils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Explore'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** fragment_venue_list.xml + VenueListFragment ("Search" tab) */
export default function ExploreScreen({ navigation }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [all, setAll] = useState<Venue[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.venues
      .list()
      .then(setAll)
      .catch((e) => toast(`Error loading venues: ${e.message}`))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const venues = useMemo(() => filterVenues(all, query), [all, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPage, paddingTop: insets.top }}>
      <Text style={{ marginLeft: 24, marginTop: 32, fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
        Explore Venues
      </Text>
      <OutlinedInput
        label="Search by name or location" value={query} onChangeText={setQuery} startIcon="search"
        radius={28} style={{ marginHorizontal: 24, marginTop: 16 }}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primaryBlue} />
      ) : venues.length === 0 ? (
        <Text style={{ marginTop: 40, textAlign: 'center', fontSize: 16, color: colors.textSecondary }}>No venues found</Text>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(v) => v.id}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <VenueCard venue={item} onPress={(venue) => navigation.navigate('VenueDetails', { venue })} />
          )}
        />
      )}
    </View>
  );
}
