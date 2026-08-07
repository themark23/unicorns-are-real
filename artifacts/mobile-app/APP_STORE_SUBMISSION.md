# Unicorn Valley — Apple App Store Submission Guide

Everything you need to get **Unicorn Valley** onto the App Store. You do **not**
need a Mac — Expo's EAS Build compiles the app in the cloud and can upload it for
you.

---

## 0. What's already done for you

Your project is submission-ready on the config side:

| Item | Value | Status |
|---|---|---|
| App name | Unicorn Valley | ✅ |
| Bundle ID | `net.unicornsarereal.unicornvalley` | ✅ |
| Version / Build | `1.0.0` / `1` | ✅ |
| Orientation | Portrait only, full-screen | ✅ |
| Device | iPhone only (`supportsTablet: false`) | ✅ |
| App icon | 1024×1024, full-bleed, no transparency | ✅ |
| Splash screen | Dedicated `splash.png` | ✅ |
| Encryption declaration | `ios.config.usesNonExemptEncryption: false` | ✅ |
| Tracking / ads / analytics | None (kid-safe) | ✅ |
| Camera / location / mic | Not used — no permission prompts | ✅ |
| Sound | Music + SFX, with an in-app off switch | ✅ |
| Privacy policy | <https://unicornsarereal.net/unicorn-valley/privacy> | ✅ |
| `eas.json` build config | Created | ✅ |

> **Corrections, August 7 2026.** An earlier version of this table claimed the
> icon and the encryption declaration were fine. Neither was:
>
> - The icon had rounded corners baked in over a **black** background. iOS
>   applies its own rounded mask, so it would have shipped with black wedges in
>   the corners — which Apple rejects. The purple field has been reconstructed
>   out to full bleed.
> - `usesNonExemptEncryption` was set at `ios.usesNonExemptEncryption`, which
>   Expo ignores. The key it actually reads is `ios.config.usesNonExemptEncryption`.
>   As written, every upload would have stalled on the export-compliance question.
>
> Also fixed since: runtime dependencies were declared as `devDependencies`,
> the `expo-router` plugin carried Replit's dev origin, and `expo-location` and
> `expo-image-picker` were installed but never used.

The only things left are **accounts, cloud build, screenshots, and the store
listing**. Follow the steps below in order.

---

## 1. Accounts you need (one-time)

1. **Apple Developer Program** — $99/year. Enroll at
   <https://developer.apple.com/programs/> (allow up to 48h for approval).
2. **Expo account** — free. Sign up at <https://expo.dev/signup>.

## 2. Install the build tool (one-time)

```bash
npm install -g eas-cli
eas login          # sign in with your Expo account
```

> ⚠️ Run all `eas` commands from **inside `artifacts/mobile-app`**, not the repo root.
> This is a pnpm monorepo; the lockfile at the repo root is picked up automatically
> by EAS. If the very first cloud build fails on dependency install, run
> `eas build --platform ios --profile production --clear-cache` once.

---

## 3. Build the app in the cloud

```bash
cd artifacts/mobile-app
eas build --platform ios --profile production
```

On the first run EAS will:
- Ask to **register your Bundle ID** (`net.unicornsarereal.unicornvalley`) with Apple — say yes.
- **Generate the signing certificate and provisioning profile** for you (let EAS
  manage credentials — this is the easy, recommended path).
- Build a `.ipa` in the cloud (~10–20 min) and give you a download link.

You'll need your **Apple Team ID** (find it at
<https://developer.apple.com/account> → Membership).

---

## 4. Create the app record in App Store Connect

Go to <https://appstoreconnect.apple.com> → **My Apps** → **＋ → New App**:

- **Platform:** iOS
- **Name:** Unicorn Valley *(must be globally unique — see fallback names below)*
- **Primary language:** English (U.S.)
- **Bundle ID:** `net.unicornsarereal.unicornvalley` (pick from the dropdown)
- **SKU:** `unicorn-valley-001` (any private string)
- **User access:** Full Access

> If "Unicorn Valley" is taken, try: *Unicorn Valley: Magic Play*, *Unicorn Valley
> Playtime*, or *Unicorn Valley — Hidden Sparkles*. The name here is your store
> title; the bundle ID stays the same.

After the app record exists, copy its **Apple ID number** (a long number shown on
the app's App Information page). Put it, your Apple ID email, and your Team ID into
`eas.json` under `submit.production.ios` (three `REPLACE_WITH_...` placeholders).

---

## 5. Upload the build

```bash
eas submit --platform ios --profile production --latest
```

This pushes the build from step 3 into App Store Connect. It appears under
**TestFlight / Build** after ~5–15 min of Apple processing.

---

## 6. Fill out the store listing

In App Store Connect, on your app's **1.0 Prepare for Submission** page:

### Required text
- **Subtitle** (30 chars): e.g. *Magical drag-and-play for kids*
- **Promotional text** (170 chars, editable anytime)
- **Description** — a draft is in the appendix below; edit to taste.
- **Keywords** (100 chars, comma-separated): `unicorn,kids,toddler,play,animals,magic,hidden objects,preschool,sparkle`
- **Support URL** — **required.** A simple page or even a mailto page works.
- **Marketing URL** — optional.
- **Copyright:** `2026 <your name / company>`

### Screenshots — REQUIRED
Apple currently requires the **6.9"/6.7" iPhone** size. Provide at least 3
(up to 10). Because the app is iPhone-only, you do **not** need iPad shots.

| Display | Pixel size (portrait) | Example device |
|---|---|---|
| 6.9" (required) | **1320 × 2868** | iPhone 16 Pro Max |
| 6.7" (accepted) | **1290 × 2796** | iPhone 15 Pro Max |

How to capture: run the app in the **iOS Simulator** (or on a device via
TestFlight) and screenshot each of the 6 scenes with a couple of unicorns placed.
See "Getting screenshots without a Mac" below if you don't have one.

### App icon
Pulled automatically from your build's 1024×1024 icon — nothing to upload.

---

## 7. App Privacy (the "nutrition label") — REQUIRED

App Store Connect → your app → **App Privacy**:

- **Data collection:** select **"No, we do not collect data from this app."**
  (Unicorn Valley has no accounts, analytics, ads, or network calls that gather
  personal data.)
- **Privacy Policy URL:** **required for all apps, and strictly enforced for
  kids' apps.** A short static page is fine — a ready-to-host draft is in the
  appendix. I can host it for you on your Replit web/API artifact if you want.

## 8. Age rating & category

- **Age Rating:** open the questionnaire → answer "None" to all mature-content
  questions → you'll get **4+**.
- **Category:** Primary **Games** (secondary *Education* is a good fit), **or**
  the **Kids** category (see next section).

---

## 9. Kids-app compliance (ages 4–11) — READ THIS

Your app targets young children, so Apple applies extra scrutiny. Good news:
you already meet the hard requirements. Keep it that way.

✅ **You currently pass because:**
- No third-party analytics, ads, or tracking of any kind.
- No data collection (declare "No data collected").
- No external links, no in-app purchases, no sign-in, no social features.

⚠️ **If you ever add any of the following, you MUST also add a "parental gate"**
(a task a child can't easily do, e.g. "hold to continue" or a math question)
**before** it:
- Any button that opens a website / the App Store / email.
- In-app purchases or a "rate us" prompt.
- Any social or sharing feature.

**Choosing the Kids category is optional.** You can ship as **Games, rated 4+**
without joining the Kids category and face lighter review requirements. Only opt
into the **Kids** category if you specifically want the Kids-category placement —
it mandates the privacy policy + no third-party ads/analytics (which you already
satisfy) and a parental gate on any external link.

---

## 10. Submit for review

Attach the processed build to the 1.0 version → **Add for Review** → **Submit**.
First reviews typically take 24–48h. If rejected, Apple tells you exactly why in
the Resolution Center; fix and resubmit (no extra fee).

---

## 11. Shipping future updates

1. Bump versions in `app.json`:
   - `expo.version` → e.g. `1.0.1` (marketing version users see)
   - `expo.ios.buildNumber` → increment every upload (`"2"`, `"3"`, …)
     *(the `production` profile in `eas.json` has `autoIncrement`, so EAS will
     bump the build number for you automatically.)*
2. `eas build --platform ios --profile production`
3. `eas submit --platform ios --profile production --latest`
4. Add a new version in App Store Connect, update "What's New", submit.

---

## Appendix A — Getting screenshots without a Mac

- **Best:** after step 5, install the build via **TestFlight** on a real iPhone
  (or borrow a 6.7"/6.9" device) and screenshot the 6 scenes.
- **No device:** use a cloud Mac service (e.g. MacStadium, or a friend's Mac with
  Xcode's free iOS Simulator) to run a simulator build
  (`eas build --profile preview` produces a simulator build) and screenshot there.
- Frame/upscale tools like the free **Screenshot.rocks** or **Previewed** can
  turn one clean capture into all required sizes.

## Appendix B — Draft store description (edit freely)

> **Unicorn Valley** is a gentle, ad-free play world made for little hands. Drag
> five magical unicorns across six dreamy panoramic scenes — beaches, rainbows,
> waterfalls and more — and discover sparkly hidden treasures along the way.
>
> • Five adorable unicorns to play with
> • Six hand-painted scenes to explore
> • Delightful sparkles, sounds, and reactions
> • No ads. No in-app purchases. No tracking. No internet required.
> • Designed for ages 4–11
>
> Safe, calm, and endlessly replayable — Unicorn Valley is a magical little
> corner just for your child.

## Appendix C — Draft privacy policy (host this, then paste the URL)

> **Unicorn Valley Privacy Policy**
> Last updated: <date>
>
> Unicorn Valley does not collect, store, transmit, or share any personal
> information. The app contains no ads, no analytics, no tracking, and no
> account system, and it does not require an internet connection to play. No
> data ever leaves your device.
>
> Because we collect no data, there is nothing to request, correct, or delete.
> For any questions, contact: <your email>.

---

### Quick reference — the whole flow

```bash
# one-time
npm install -g eas-cli && eas login

# every release
cd artifacts/mobile-app
eas build  --platform ios --profile production
eas submit --platform ios --profile production --latest
# then finish the listing in App Store Connect and hit Submit for Review
```
