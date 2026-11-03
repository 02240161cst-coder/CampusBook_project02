import { ImageSourcePropType } from 'react-native';
import { Venue } from '../types';

const IMG = {
  conventional: require('../../assets/venues/conventional_hall.jpg'),
  lh: require('../../assets/venues/lh_hall.jpg'),
  smart: require('../../assets/venues/smart_classroom.jpg'),
  enterprise: require('../../assets/venues/enterprise_hall.jpg'),
  football: require('../../assets/venues/football_ground.jpg'),
  basketball: require('../../assets/venues/indoor_basketball_court.jpg'),
  badminton: require('../../assets/venues/indoor_badminton_court.jpg'),
  volleyMale: require('../../assets/venues/volleyball_court_male.jpg'),
  volleyFemale: require('../../assets/venues/volleyball_court_female.jpg'),
  tennis: require('../../assets/venues/indoor_tennis_court.jpg'),
};

/** Port of VenueImageMapper (same keyword order). Returns null → grey placeholder. */
export function getVenueImage(venue: Venue): ImageSourcePropType | null {
  const n = venue.name.toLowerCase().trim();
  if (n.includes('conventional')) return IMG.conventional;
  if (n.includes('lh')) return IMG.lh;
  if (n.includes('smart')) return IMG.smart;
  if (n.includes('enterprise')) return IMG.enterprise;
  if (n.includes('football')) return IMG.football;
  if (n.includes('basketball')) return IMG.basketball;
  if (n.includes('badminton')) return IMG.badminton;
  if (n.includes('volleyball') && n.includes('female')) return IMG.volleyFemale;
  if (n.includes('volleyball') && n.includes('male')) return IMG.volleyMale;
  if (n.includes('tennis')) return IMG.tennis;
  return null;
}
