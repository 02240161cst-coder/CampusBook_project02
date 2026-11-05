import { Venue } from '../types';

/**
 * Default campus venues (same 10 names that Project I's VenueUtils /
 * VenueImageMapper are written for). If your Firestore `venues`
 * collection already has data from Project I, that data is used instead.
 * Locations/descriptions are placeholders – edit them freely.
 */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCF2kHLldG9yQUmUMdm72WUxV8bzGUl7Y",
  authDomain: "campusbook-32e90.firebaseapp.com",
  projectId: "campusbook-32e90",
  storageBucket: "campusbook-32e90.firebasestorage.app",
  messagingSenderId: "240017642208",
  appId: "1:240017642208:web:b3f40a14d2a3df8470f685",
  measurementId: "G-WDNDVFB23C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const SEED_VENUES: Omit<Venue, 'id'>[] = [
  {
    name: 'Conventional Hall',
    location: 'CST Campus, Main Complex',
    description:
      'The largest indoor venue on campus. Suitable for convocations, cultural programmes, assemblies and large college events with fixed seating, a stage and a sound system.',
    category: 'Hall',
    capacity: 900,
  },
  {
    name: 'LH Hall',
    location: 'CST Campus, Lecture Hall Block',
    description:
      'A spacious lecture hall suited to seminars, guest lectures, workshops and club orientations.',
    category: 'Hall',
    capacity: 150,
  },
  {
    name: 'Smart Classroom',
    location: 'CST Campus, Academic Block',
    description:
      'A technology-enabled classroom with a projector and smart board. Ideal for presentations, training sessions and group meetings.',
    category: 'Meeting Room',
    capacity: 100,
  },
  {
    name: 'Enterprise Hall',
    location: 'CST Campus, Administrative Block',
    description:
      'A formal meeting hall reserved for staff-level meetings, board discussions and official college functions.',
    category: 'Meeting Room',
    capacity: 30,
  },
  {
    name: 'Football Ground',
    location: 'CST Campus, Sports Complex',
    description:
      'The main outdoor football field for matches, inter-class tournaments and training sessions.',
    category: 'Sports Ground',
    capacity: 35,
  },
  {
    name: 'Indoor Basketball Court',
    location: 'CST Campus, Indoor Sports Hall',
    description:
      'A full indoor basketball court with a polished wooden floor for matches and practice.',
    category: 'Sports Ground',
    capacity: 20,
  },
  {
    name: 'Indoor Badminton Court',
    location: 'CST Campus, Indoor Sports Hall',
    description:
      'Indoor badminton courts with marked lines and nets for singles and doubles play.',
    category: 'Sports Ground',
    capacity: 10,
  },
  {
    name: 'Volleyball Court (Male)',
    location: 'CST Campus, Sports Complex',
    description: 'Outdoor volleyball court allocated for male teams and practice sessions.',
    category: 'Sports Ground',
    capacity: 15,
  },
  {
    name: 'Volleyball Court (Female)',
    location: 'CST Campus, Sports Complex',
    description: 'Outdoor volleyball court allocated for female teams and practice sessions.',
    category: 'Sports Ground',
    capacity: 15,
  },
  {
    name: 'Indoor Tennis Court',
    location: 'CST Campus, Indoor Sports Hall',
    description: 'Indoor tennis court for friendly matches and coaching sessions.',
    category: 'Sports Ground',
    capacity: 8,
  },
];
