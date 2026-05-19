# Tethered — A Couple Memory App

A private, offline-first mobile app for two people. Photos, memories, chats,
moods, voice notes, a relationship calendar, a 10-year "Black Box", weekly
letters, and a couple quiz — all living on your own phone, with optional
cloud sync.

- **Built with:** React Native + Expo SDK 51 (managed workflow)
- **Storage:** AsyncStorage (all data on-device)
- **Sync (optional):** Firebase Firestore free tier, plus manual text-share
- **Photos:** Reads your existing phone library (no copies made)
- **Auth (optional):** Google Sign-In + Google Calendar
- **Cost to run:** $0. No backend. Self-hosted from GitHub.

---

## What\u2019s inside

| Tab | What it is |
| --- | --- |
| **Home** | Today\u2019s mood card, **Memory of the Day** resurfaced from your saved notes, days together, next upcoming milestones, shortcuts everywhere. |
| **Timeline (Story)** | Photos + memories + chats + **voice notes** + milestones, auto-grouped into seasonal "time cards" you can tap to relive a whole chapter. |
| **Calendar** | Hand-edited relationship milestones, marked on a clean month grid. Long-press any milestone to push it to Google Calendar (yearly repeat). |
| **Vault (Black Box)** | Letters and photos sealed until a future date — 1, 5, 10, 20, or 25 years away. The app refuses to open them until the day arrives. |
| **Us (Settings)** | Google sign-in, partner sync code, manual text export/import, **reminders**, **PDF photobook export**, profile, reset. |

Plus, accessible from the Home tab:

- **Memories** — long-form, mood-tagged moments with photos
- **Letters** — slow weekly/bi-monthly letters to your partner, with prompts
- **Voice Notes** — record a whisper, an apology, a song; play back any time
- **Memory of the Day** — one randomly-but-deterministically chosen memory per day, mirrored to a 9 a.m. notification
- **Couple Quiz** — four hand-written question packs in pass-the-phone format
- **Mood check-in** — one entry per day, per partner
- **Photo Picker** — manually mark which photos belong to your shared story (face-detection auto-pick is on the roadmap)

### Reminders Tethered schedules for you (opt-in, from Settings → Reminders)

| Reminder | When |
| --- | --- |
| Memory of the day | Daily, 9:00 a.m. |
| Anniversary heads-up | 7 days before every occasion |
| Anniversary day-of | 8:30 a.m. on the day |
| Vault opening | 9:00 a.m. on the unlock date |
| Sunday letter nudge | Every Sunday, 7:00 p.m. |

---

## Quick start

```bash
# 1) Clone
git clone <your-fork-url> tethered
cd tethered

# 2) Install
yarn install

# 3) Optional config (Google + Firebase). All optional — app works without.
cp .env.example .env
# edit .env

# 4) Run
yarn start
# Then scan the QR code with the Expo Go app on your phone.
```

You only need a free **Expo Go** app on each partner\u2019s phone for daily use.
If you want a standalone .apk or .ipa, follow the "Build" section below.

---

## Optional: Google Sign-In + Google Calendar

You only need this if you want to push relationship milestones to Google
Calendar. Skip if you don\u2019t.

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. Create a new project and enable the **Google Calendar API** (APIs & Services → Library).
3. Configure the **OAuth consent screen** (External, add your own email as a test user, add scopes `openid email profile https://www.googleapis.com/auth/calendar`).
4. Create **OAuth client IDs** — one each for **iOS**, **Android**, and **Web**:
   - iOS: bundle identifier `com.tethered.couplememory` (must match `app.json`)
   - Android: package `com.tethered.couplememory`, plus the SHA-1 of your debug or upload keystore
   - Web: leave redirect URI blank for Expo dev; for production use `https://auth.expo.io/@your-expo-username/tethered-couple-memory`
5. Drop the three (or four) IDs into `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=...   # only if using Expo Go proxy
   ```
6. Restart the app. Open **Us → Google → Sign in**.

---

## Optional: Firebase cloud sync

This lets both partners\u2019 phones share the same data automatically.
Free tier is more than enough for two people.

1. Create a project at <https://console.firebase.google.com>.
2. Open **Firestore** → Create database → Start in **test mode**.
3. In Project Settings → Your apps → **Web**, register a web app and copy
   the config values into `.env`:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```
4. Optional, recommended Firestore rules — restrict reads/writes to known
   pairing codes only:
   ```
   match /couples/{code} {
     allow read, write: if code.size() > 5;
   }
   ```
5. Restart the app. Open **Us → Sync with your partner → Generate code**.
   Share the code with your partner. They open the same screen on their
   phone and tap **Use existing code**.
6. Push and pull with the two big buttons. The app exports your local
   AsyncStorage into a single Firestore document keyed by the code, and
   imports the partner\u2019s side on demand.

### No Firebase? Still works.

The **Manual share** section in Settings exports your whole vault as a
base64 string. Send it to your partner over WhatsApp / iMessage / Signal /
anywhere, and they paste it under **Import**. The data merges in.

---

## Build a standalone app (optional)

Expo provides cloud builds via EAS:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android   # produces an .apk
eas build -p ios       # requires an Apple Developer account
```

For pure self-hosting without EAS, use `expo prebuild` to generate native
projects and build with Android Studio / Xcode locally.

---

## Project layout

```
.
├── App.js                       # bootstrap + initial route
├── app.json                     # Expo config + permissions
├── src/
│   ├── navigation/AppNavigator  # tabs + stack
│   ├── screens/                 # one file per screen
│   ├── components/              # reusable UI
│   ├── services/
│   │   ├── storage.js           # AsyncStorage CRUD
│   │   ├── photos.js            # expo-media-library helpers
│   │   ├── googleAuth.js        # expo-auth-session Google provider
│   │   ├── googleCalendar.js    # REST calls to Calendar API
│   │   ├── firebaseSync.js      # optional Firestore sync
│   │   ├── peerSync.js          # manual export/import
│   │   └── timeline.js          # season-grouping logic
│   ├── data/quizQuestions.js    # quiz packs (hand-written, no AI)
│   ├── theme/                   # colors + typography
│   └── utils/                   # dates, uuid
└── README.md
```

---

## Design

- **Aesthetic**: a warm "scrapbook on paper" feeling — cream background,
  terracotta ink, hand-stitched borders, gentle card tilts on the timeline.
- **Typography**: a serif (Georgia / system serif) for headlines, italic
  serif for romantic accents, and a monospace caption for dates so the
  layout has visual texture.
- **Mood**: not pink-and-purple. Not "cute". Editorial, tactile, quiet.
- **Accessibility**: large tap targets, high contrast (ink #211913 on cream
  #FFF6EC ≈ 14:1), `testID` on every interactive surface.

---

## Roadmap

- On-device face clustering to auto-suggest "this is you two" photos (requires bare workflow or a custom dev-client — deferred from v1)
- Local Wi-Fi peer sync over Bonjour / mDNS (requires native modules — deferred from v1; current alternatives: Firebase + base64 text-share)
- Home-screen widget showing days until next anniversary (iOS WidgetKit / Android AppWidget — native code)

---

## License

MIT — yours to fork, change, gift to your partner.
