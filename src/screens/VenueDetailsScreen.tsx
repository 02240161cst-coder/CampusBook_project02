import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { elevation, useColors } from '../theme';
import { getVenueImage } from '../utils/venueImages';
import { canBookVenue, getVenueCapacity, isExclusive } from '../utils/venueUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'VenueDetails'>;

/** activity_venue_details.xml + VenueDetailsActivity */
export default function VenueDetailsScreen({ navigation, route }: Props) {
  const colors = useColors();
  const { venue } = route.params;
  const insets = useSafeAreaInsets();
  const img = getVenueImage(venue);
  const exclusive = isExclusive(venue);
  const { role } = useAuth();
  const allowed = canBookVenue(venue, role);

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPage }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* hero image + floating back button */}
        <View>
          {img ? (
            <Image source={img} style={{ width: '100%', height: 300, backgroundColor: colors.photoFrameGrey }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: 300, backgroundColor: colors.photoFrameGrey }} />
          )}
          <Pressable
            onPress={() => navigation.goBack()}
            style={[
              {
                position: 'absolute', left: 24, top: insets.top + 24, width: 48, height: 48, borderRadius: 24,
                backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
              },
              elevation(4),
            ]}
          >
            <Icon name="back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* info card overlapping the hero */}
        <Card radius={20} elevationDp={2} style={{ marginHorizontal: 24, marginTop: -40 }}>
          <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>{venue.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Icon name="search" size={16} color={colors.textMuted} />
              <Text style={{ flex: 1, marginLeft: 8, fontSize: 14, color: colors.textSecondary }}>{venue.location}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 8 }}>
              {exclusive ? (
                <Chip label="Staff Level Only" bg={colors.exclusiveBg} color={colors.exclusiveRed} fontSize={14} />
              ) : (
                <Chip label={venue.category || 'General'} fontSize={14} />
              )}
              <Chip label={`${getVenueCapacity(venue)} People`} icon="profile" bg={colors.surfaceVariant} color={colors.textPrimary} fontSize={14} />
            </View>
          </View>
        </Card>

        {!allowed ? (
          <View
            style={{
              marginHorizontal: 24, marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: colors.exclusiveBg,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.exclusiveRed, fontWeight: '600' }}>
              This venue is reserved for staff. Log in with a Staff account to book it.
            </Text>
          </View>
        ) : null}

        <Text style={{ marginLeft: 24, marginTop: 24, fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>Description</Text>
        <Text style={{ marginHorizontal: 24, marginTop: 12, fontSize: 15, lineHeight: 15 + 8, color: colors.textSecondary }}>
          {venue.description}
        </Text>
      </ScrollView>

      <Button
        title={allowed ? 'Book This Venue' : 'Staff Access Required'} disabled={!allowed} height={64} radius={16} fontSize={16}
        style={{ margin: 24, marginBottom: 24 + Math.max(insets.bottom - 8, 0) }}
        onPress={() => navigation.navigate('SelectDate', { venue })}
      />
    </View>
  );
}
