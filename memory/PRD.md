# Tethered — Product Requirements (Living Document)

## Original problem statement

Build a mobile app: Couple Memory app that works even in offline mode.
It will only have that user couple photos, memories, events, chats, voice
notes and all the special occasions. It should be able to read the phone's
photos and sort the couple's photos and videos in order of their lifetime.
It should line up time line with graphics and texts timelines combined.
Like, say when they were planning their wedding how they chatted and what
photos they shared during that time and how it went, and the app shows it
like a time card and when you tap that you get to see the whole timeline
with texts and media.

It should be a shared application so both couple can edit it and share
their feelings with each other on that day. Share what their mood is,
date, caption of memory, may be a feature to write a letter to my
partner weekly or bimonthly.

It should also have Relationship calendar as its core idea that shows
special occasions that the user can edit, like first meeting, first kiss,
first fight, anniversary, so they can remember it each year.

Have a feature like a black box that opens memories after a decade. And
the couple can enjoy that. This app should be able to connect to google
to authenticate the users and then have their google calendar access to
add the dates.

Another core feature can be couple Quiz so each partner can know how
well they know each other.

The application should be hosted on the phone itself. Keep the
dependencies minimal, do not want to pay for server costs and any
hosting for now. I can self host on my PC. Just need all the files on
my github.

## User choices (recorded)

- Platform: React Native (Expo)
- Auth: Google Sign-In + Google Calendar (client-side, optional)
- Sync: Firebase free-tier + Wi-Fi / manual peer share
- AI: None — pre-written quiz bank
- Photo sorting: Manual now, auto-detect later

## Architecture

- Single Expo app, no backend.
- AsyncStorage as the single source of truth on each device.
- Firebase Firestore (optional) acts as a postbox keyed by a shared "couple
  code". Each device exports its full AsyncStorage to a single Firestore
  doc; the partner imports it on demand.
- Google Calendar accessed directly via REST from the device. Access token
  cached in AsyncStorage. No refresh-token storage (OAuth best practice for
  installed apps without a backend) — user re-prompts when token expires.
- Photos stay in the device gallery (`expo-media-library`); we persist
  only the asset IDs.

## Personas

- **Asha & Rohan, long-distance**: weekly letters, mood check-ins, shared
  calendar reminders.
- **A married couple with kids**: weekend ritual of opening last week\u2019s
  letters; vault sealed on each anniversary.
- **A new couple**: Calendar with "first meeting" + "first kiss" already
  warming up, photo picker building the early Story.

## Implemented (Jan 2026)

- Onboarding (names, start date, couple title, fully local)
- Home dashboard with today\u2019s mood, days-together counter, upcoming
  anniversaries, quick-access shortcuts
- Timeline with seasonal "Time Cards" grouping photos, memories, chats,
  milestones
- Timeline Detail screen
- Memory CRUD (text + photo + mood + author)
- Relationship Calendar (with month grid + countdowns)
- Add Occasion with suggestion chips + push-to-Google-Calendar (long-press)
- Black Box / Vault: sealed letters with 1 / 5 / 10 / 20 / 25-year unlocks
- Letters with prompts and authorship
- Mood check-in (one per day per partner, history)
- Photo Picker reading the device library (paginated, manual selection)
- Couple Quiz with four hand-written packs, pass-the-phone gameplay,
  scoring + verdict
- Settings: Google sign-in, Firebase push/pull, pairing code, manual
  text export/import, reset

## Backlog (priority order)

- **P1** Face clustering on-device (TensorFlow Lite + MobileFaceNet) so
  the photo picker can auto-suggest the couple\u2019s photos.
- **P1** Voice-note recorder using `expo-av`, surfaced on Timeline.
- **P2** Local Wi-Fi peer sync over Bonjour/mDNS (replaces Firebase for
  fully offline households).
- **P2** Push notifications: yearly anniversary reminders, weekly letter
  nudges, Black Box "your letter is opening soon" countdown.
- **P3** PDF / printable photobook export.
- **P3** Widget: days to next anniversary on the home screen.

## What\u2019s deferred and why

- Auto face-detection: requires a TFLite model and `expo-camera` —
  doable in v1.1 once the user has the app running.
- Real-time chat between partners: the user explicitly said "minimal
  dependencies, no server". Letters + manual sync fill the gap.

## Test status

End-to-end happy path was validated by bundling the full Expo app with
`expo export --platform web` (914 modules, 0 errors). The bundle output
sits under `/tmp/expo-build/` during CI. On-device behaviour requires
running `yarn start` and pairing with Expo Go (out of scope for this
sandbox).

## Next tasks (suggested)

1. User clones the repo to their PC, runs `yarn install`, scans the QR
   with Expo Go on both phones, walks through onboarding together.
2. (Optional) Set up Firebase + Google OAuth as documented in README.md.
3. After a week of use, gather feedback for v1.1 (likely: voice notes +
   face-clustering for auto photo picker).
