# Deploying Tethered to TestFlight (and beyond)

This walkthrough takes you from a fresh checkout of this repo to a working
build of Tethered on your iPhone via TestFlight. **No Mac required** — we
use Expo's EAS Build cloud service, which compiles on Apple silicon Macs
in the cloud and ships you an `.ipa` you can submit straight to App Store
Connect.

> **What you need before you start**
> - Apple Developer Program membership (paid, $99/yr) — you said you have this ✅
> - An Expo account (free) — sign up at <https://expo.dev/signup>
> - Node.js 18+ on your local machine (any OS — Linux, Windows, Mac all work)
> - The `eas-cli` installed: `npm install -g eas-cli`
> - This repo cloned from your GitHub

---

## Part 1 — One-time Apple Developer setup (10 minutes)

You only need to do this once for the whole life of the app.

### 1.1 Confirm your Team ID and Apple ID

1. Sign in at <https://developer.apple.com/account>.
2. In the top-right, click your name → note your **Team ID** (a 10-character code like `A1B2C3D4E5`).
3. Your **Apple ID** is the email you sign in with.

### 1.2 Register the bundle identifier

EAS can do this automatically the first time you build, but doing it
explicitly avoids surprises.

1. Go to <https://developer.apple.com/account/resources/identifiers/list>.
2. Click **+** to create a new identifier → choose **App IDs** → **App**.
3. Description: `Tethered`. Bundle ID (Explicit): `com.tethered.couplememory`
   (must match `ios.bundleIdentifier` in `app.json` — if you fork and rename,
   change it in **both** places).
4. Capabilities you can leave default — Push Notifications is **not**
   required because the app only uses **local** notifications.
5. **Save**.

### 1.3 Create the app in App Store Connect

1. Go to <https://appstoreconnect.apple.com/apps>.
2. Click **+ → New App**.
3. Platform: **iOS**. Name: `Tethered` (or whatever — must be unique on
   App Store Connect). Primary language: English. Bundle ID: pick the
   `com.tethered.couplememory` you just made. SKU: `tethered-001`
   (any unique string). User access: Full.
4. **Create**.
5. After it loads, copy the **Apple ID (App Store Connect ID)** — a
   long numeric string visible in the app's URL or under **App Information**.
   Keep this — you'll paste it into `eas.json` in a moment.

---

## Part 2 — Configure this repo for EAS (5 minutes)

```bash
git clone <your-github-url> tethered
cd tethered
yarn install
npm install -g eas-cli
eas login                # sign in with your Expo account
```

### 2.1 Bind the repo to your Expo project

```bash
eas init
```

This:
- Creates a project on expo.dev under your account.
- Writes the project ID into `app.json` under `extra.eas.projectId`
  (replacing the placeholder we left).

### 2.2 Plug your Apple identifiers into `eas.json`

Open `eas.json` and fill in the three placeholders under `submit.production.ios`:

```jsonc
"submit": {
  "production": {
    "ios": {
      "appleId":     "you@example.com",       // your Apple ID email
      "ascAppId":    "1234567890",            // the numeric App Store Connect ID from step 1.3
      "appleTeamId": "A1B2C3D4E5"             // your 10-char Team ID from step 1.1
    }
  }
}
```

> `eas.json` is **safe to commit** — none of those values are secrets,
> they're identifiers. Your Apple password / App-Specific Password / API
> key is stored only on EAS's servers (or your local keychain), never
> in the repo.

### 2.3 (Optional but recommended) Add your secrets to EAS

If you want Google Sign-In or Firebase to work in the built app, the
`EXPO_PUBLIC_*` env vars from your `.env` need to be available to the
build, not just to local `yarn start`. Push them to EAS once:

```bash
eas env:push production --path .env
```

(`eas env:push` reads each line of `.env` and uploads it as an EAS
Secret bound to the `production` build profile. Re-run after edits.)

If you're testing the offline-only flows first, skip this step — the app
runs perfectly without any of those vars.

---

## Part 3 — Build the .ipa (15–25 minutes, cloud-side)

You have two build profiles set up in `eas.json`:

| Profile | What it's for | TestFlight-compatible? |
|---|---|---|
| `preview` | Ad-hoc install on devices you manually register on the Apple Dev portal. Good for "just me trying it". | ❌ no |
| `production` | Signed for the App Store. Goes straight to TestFlight. | ✅ yes |

### 3.1 Production build (the one you want for TestFlight)

```bash
eas build --platform ios --profile production
```

What happens:
1. EAS asks "Generate a new Apple Distribution Certificate?" → **Yes**
   (only the first time; it stores it for you).
2. EAS asks "Generate a new Provisioning Profile?" → **Yes**.
3. EAS may ask for your Apple ID and an **App-Specific Password**.
   - Get one at <https://account.apple.com/account/manage> → **Sign-In and Security** → **App-Specific Passwords** → **+**. Name it `EAS`. Copy and paste when prompted.
4. The CLI uploads your code, queues the build, and prints a URL like
   `https://expo.dev/accounts/<you>/projects/tethered/builds/<id>`.
5. Walk away for 15–25 min (free tier; faster on paid plans).
6. When it's green, you'll get an `.ipa` download link in that page —
   and a **Submit** button.

### 3.2 Hand it to TestFlight — pick ONE

#### Option A: Let EAS submit it for you (one command)

```bash
eas submit --platform ios --latest
```

EAS pulls the latest production build, signs in to App Store Connect
with the credentials from `eas.json` + your App-Specific Password, and
uploads. You'll see it under **TestFlight → iOS Builds** within ~10
minutes (Apple processes it).

#### Option B: Manual upload via Transporter (no extra tooling)

1. Download the `.ipa` from the EAS build page to your computer.
2. On a Mac, install **Transporter** from the Mac App Store. Open it,
   sign in with your Apple ID, drag the `.ipa` in, click **Deliver**.
3. On Windows/Linux you can use `eas submit` (Option A) or the
   `iTMSTransporter` CLI — but honestly, Option A is easier here.

### 3.3 Get the build onto your iPhone via TestFlight

1. Apple processes the build for ~5–15 minutes ("Processing" status).
2. In App Store Connect → **TestFlight** → your build → fill in **Export
   Compliance** ("Does your app use encryption?" → **No**, because we
   set `ITSAppUsesNonExemptEncryption: false` in `app.json` — that's
   the only crypto Apple cares about for this kind of app).
3. **Internal Testing** group: click **+**, name it "Just us", add your
   Apple-ID email as a tester. Apple sends you a TestFlight invite.
4. On your iPhone, install **TestFlight** from the App Store. Open the
   invite email → tap **Accept** → **Install**.
5. Open Tethered on your phone. Done.

> Internal testing has a **100 tester** limit, requires **no Apple
> review**, and builds expire after 90 days. Perfect for you and your
> partner.

---

## Part 4 — Updating the app later

Once it's on TestFlight, day-to-day updates are smooth:

### Small JS-only changes (no native lib changes)

Use **Expo Updates** instead of rebuilding — pushes a new JS bundle to
both phones in seconds:

```bash
eas update --branch production --message "Add quiet-night mode"
```

The next time you open the app on your iPhone, the update downloads
silently.

> Note: requires installing `expo-updates` and one-time
> `eas update:configure`. Worth it if you'll iterate often.

### Adding a new native dependency

Bump `ios.buildNumber` in `app.json` (`1.0.0` → `1.0.1`, …), commit,
then:

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

---

## Common gotchas

| Symptom | Fix |
|---|---|
| `Provisioning profile doesn't include device` | You're using the `preview` profile and haven't registered the device. Either run `eas device:create` or switch to `production` (TestFlight doesn't care about device IDs). |
| `Bundle identifier already in use` | Someone else registered `com.tethered.couplememory`. Change `ios.bundleIdentifier` in `app.json` to something unique (e.g. `com.yourname.tethered`). |
| TestFlight build stuck on "Processing" > 1 hour | Almost always Apple's queue. Tap **Resubmit for Beta Review** isn't needed for *internal* testers; for *external* it is. |
| EAS build fails on `expo-print` / `expo-av` | Make sure you ran `npx expo install` (not plain `yarn add`) for any Expo SDK lib you add later — that ensures versions are aligned. |
| Notifications don't fire on the device | Local notifications work without any extra setup on iOS. If they're not appearing, open iPhone Settings → Notifications → Tethered and make sure alerts are allowed. |

---

## Cost summary

| Item | Cost |
|---|---|
| Apple Developer Program | $99/year (you have this) |
| Expo account + EAS free tier | $0 (~30 iOS builds/month free) |
| TestFlight internal testing | $0 |
| Firebase free tier (if you use sync) | $0 for two-person use |
| Google Cloud OAuth (if you connect Calendar) | $0 |
| **Total to run Tethered with TestFlight** | **$99/year** |

You're set. Once you push to GitHub and run `eas build --platform ios --profile production`, you'll have an `.ipa` on TestFlight in under an hour.
