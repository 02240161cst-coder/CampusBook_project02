# CampusBook – React Native (Expo)

A React Native port of the **Project I** Android app (Kotlin) – same screens, colours,
spacing, icons and business rules – ready to be extended with the Project II features.

---

## 1. Run it (5 minutes)

```bash
# 1) create a fresh Expo project
npx create-expo-app@latest CampusBook --template blank-typescript
cd CampusBook

# 2) copy these items from this folder INTO the new project (overwrite when asked):
#       App.tsx   app.json   src/   assets/   tests/   firestore.rules

# 3) install the libraries (expo install picks versions that match your SDK)
npx expo install react-native-svg react-native-screens react-native-safe-area-context \
  @react-native-async-storage/async-storage @react-native-community/datetimepicker
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs firebase

# 4) start
npx expo start          # press "a" for Android, "i" for iOS, or scan the QR with Expo Go
```

Out of the box the app runs on a **local demo backend** (`USE_FIREBASE = false` in
`src/config.ts`): register an account and everything works offline. One booking
(Conventional Hall, today 10:00–12:00) is pre-loaded so you can see the conflict check immediately.

---

## 2. Connecting Firebase (Authentication + Firestore)

Your Android app already uses Firebase project **`campusbook-32e90`**. This app uses the
**same project and the same collections**, so existing users, venues and bookings keep working.

1. **Add a Web app** – Firebase console → ⚙ Project settings → *Your apps* → **Add app → Web (`</>`)**
   → nickname “CampusBook RN” → copy the `firebaseConfig` object.
   *(The Android `google-services.json` is not used by React Native's JS SDK.)*
2. **Enable email login** – Build → Authentication → Sign-in method → **Email/Password** → Enable
   (already on if the Android app works).
3. **Firestore** – Build → Firestore Database (already created for Project I).
   Open the **Rules** tab, paste the contents of `firestore.rules`, **Publish**.
4. **Paste the config** into `src/config.ts` and flip the switch:
   ```ts
   export const USE_FIREBASE = true;
   export const firebaseConfig = { apiKey: '...', authDomain: '...', projectId: 'campusbook-32e90', ... };
   ```
5. **Venues** – if your `venues` collection already has the Project I documents, nothing to do.
   If it is empty, the app uploads the 10 default venues on first launch
   (`SEED_VENUES_IF_EMPTY`). For that one launch add `allow create: if request.auth != null;`
   inside `match /venues/{venueId}` in the rules, then remove it again.
6. Restart with a clean cache: `npx expo start -c`, register a user, then check
   *Authentication → Users* and *Firestore → users / bookings* in the console.

### Firestore data model (unchanged from Project I)

| Collection | Document fields |
|---|---|
| `users/{uid}` | `uid, fullName, studentId, email, userType ("Student")` |
| `venues/{id}` | `name, location, description, category, capacity` |
| `bookings/{id}` | `userId, venueName, bookingDate ("dd/MM/yyyy"), startTime ("09:00 AM"), endTime, startTimeMinutes, endTimeMinutes, createdAt (Timestamp), purpose, attendees, requirements` |

Keep the date format `dd/MM/yyyy` and the `*Minutes` fields – the conflict check depends on them.
No composite index is needed (My Bookings is sorted on the device).

> **Double-booking note:** like Project I, the conflict check reads the day's bookings and then
> writes. Two people tapping *Confirm* in the same second could theoretically both succeed.
> For stricter protection later, move the check into a Cloud Function / callable.

---

## 3. How Project I maps to this project

| Android (Kotlin / XML) | React Native |
|---|---|
| `colors.xml`, `themes.xml` | `src/theme/` |
| `VenueUtils`, `VenueImageMapper` | `src/utils/venueUtils.ts`, `venueImages.ts` |
| `SplashActivity` (1.2 s, checks login) | `App.tsx` + `screens/SplashScreen.tsx` |
| `LoginActivity`, `RegisterActivity` | `screens/LoginScreen.tsx`, `RegisterScreen.tsx` + `context/AuthContext.tsx` |
| `MainActivity` + bottom nav | `App.tsx` (tabs) + `navigation/TabBar.tsx` |
| `HomeFragment`, `VenueListFragment` | `screens/HomeScreen.tsx`, `ExploreScreen.tsx` |
| `VenueDetailsActivity` | `screens/VenueDetailsScreen.tsx` |
| `SelectDateActivity` | `screens/SelectDateScreen.tsx` + `components/MonthCalendar.tsx`, `TimePicker.tsx` |
| `BookingDetailsActivity` (validate → conflict → save) | `screens/BookingDetailsScreen.tsx` + `services/bookingService.ts` |
| `BookingConfirmActivity` | `screens/BookingConfirmScreen.tsx` |
| `MyBookingsFragment` | `screens/MyBookingsScreen.tsx` |
| `ManageBookingActivity` | `screens/ManageBookingScreen.tsx` |
| `ProfileFragment`, `SettingsActivity` | `screens/ProfileScreen.tsx`, `SettingsScreen.tsx` |
| Firebase calls inside activities | `src/backend/` (one interface, two implementations) |

### Business rules carried over
- Booking hours **09:00 AM – 10:00 PM**, end time after start time
- **Capacity limits**: Conventional 900 · LH Hall 150 · Smart Classroom 100 · Enterprise 30 · Football 35 · Basketball 20 · Volleyball 15 · Badminton 10 · Tennis 8 (default 50)
- **Overlap rule** `start < existingEnd && end > existingStart` (back-to-back bookings are allowed)
- Enterprise Hall shows the red **“Staff Level Only”** chip
- My Bookings: **Upcoming** = today or later, **Past** = before today, newest first
- Edit ignores the booking being edited when checking conflicts; cancel asks for confirmation

### Small intentional differences
1. Past dates cannot be selected in the booking calendar (Project I allowed it).
2. Search matches **name or location** on both Home and Search tabs (Project I's code matched name only, although the hint said “name or location”). Venue cards on the Search tab span the full width.
3. *Additional Requirements* is now saved with the booking (it was shown but discarded in Project I).
4. *Edit Profile* shows an “available in a future update” message (it did nothing in Project I).
5. “Volleyball Court (Female)” now gets the female photo (Project I's keyword order matched “male” first).

---

## 4. Tests
```bash
npm i -D tsx @types/node
npx tsx tests/logic.test.ts     # 20 checks: overlap, capacity, time rules, create/edit/cancel flow
```

## 5. Ready for Project II
`src/theme/colors.ts` is the single colour source (dark theme = add a second palette).
`UserProfile.userType` already exists for student/staff roles, `isExclusive()` is the hook for
role-based venue access, and `Backend` is the one place to add push-token storage or profile photos.
