import React from 'react';
import { Image, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Venue } from '../types';
import { colors } from '../theme';
import { getVenueCapacity, isExclusive } from '../utils/venueUtils';
import { getVenueImage } from '../utils/venueImages';
import Button from './Button';
import Card from './Card';
import Chip from './Chip';
import Icon from './Icon';

interface Props {
  venue: Venue;
  onPress: (v: Venue) => void;
  style?: StyleProp<ViewStyle>;
}

/** item_venue.xml: image, category chip, name, location, capacity, "Book Now". */
export default function VenueCard({ venue, onPress, style }: Props) {
  const exclusive = isExclusive(venue);
  const img = getVenueImage(venue);
  return (
    <Card style={[{ margin: 8 }, style]} radius={16} elevationDp={2}>
      <Pressable onPress={() => onPress(venue)} android_ripple={{ color: 'rgba(0,0,0,0.06)' }}>
        {img ? (
          <Image source={img} style={{ width: '100%', height: 150, backgroundColor: colors.photoFrameGrey }} resizeMode="cover" />
        ) : (
          <View style={{ width: '100%', height: 150, backgroundColor: colors.photoFrameGrey }} />
        )}
        <View style={{ marginLeft: 12, marginTop: 12 }}>
          {exclusive ? (
            <Chip label="Staff Level Only" bg={colors.exclusiveBg} color={colors.exclusiveRed} />
          ) : (
            <Chip label={venue.category || 'General'} />
          )}
        </View>
        <Text numberOfLines={1} style={{ marginHorizontal: 16, marginTop: 8, fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>
          {venue.name}
        </Text>
        <Text numberOfLines={1} style={{ marginHorizontal: 16, marginTop: 4, fontSize: 13, color: colors.textSecondary }}>
          {venue.location}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 12 }}>
          <Icon name="profile" size={16} color={colors.textMuted} />
          <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textMuted }}>{getVenueCapacity(venue)} Cap</Text>
        </View>
      </Pressable>
      <Button
        title="Book Now" variant="tonal" height={48} radius={12} fontSize={14}
        style={{ margin: 16 }} onPress={() => onPress(venue)}
      />
    </Card>
  );
}
