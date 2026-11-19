# FulbitoApp Mobile: From Zero to Store Publication

> **Document preview:** To preview this Markdown document in Visual Studio Code, press `Ctrl + Shift + V`.

This is the **map** of the whole process. Each step has a short description. When you need the full explanation (with screenshots), click the **Details** link of that step.

## Quick reference

| Item                | Value                                                    |
| ------------------- | -------------------------------------------------------- |
| App name            | FulbitoApp                                               |
| Bundle ID / package | `com.fulbitoapp.app` (iOS and Android)                   |
| Apple Team ID       | `KFQ42Y6Z73`                                             |
| Firebase project    | `fulbitoGM`                                              |
| App Store (iOS)     | [Fulbito App](https://apps.apple.com/us/app/fulbito-app/id6810410637) |
| Google Play (Android) | Pending: the app is still in review, URL not available yet |
| Framework           | Expo (React Native) with native builds (`ios/`, `android/`) |

## Which guide do I need?

| I want to...                                  | Go to                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Create the Apple developer account            | [Apple: account registration](./guides/apple-account-registration.md)                       |
| Create the Google Play developer account      | [Google: account registration](./guides/google-account-registration.md)                     |
| Configure and publish the iOS app             | [iOS overview: zero to TestFlight](./guides/apple.md) |
| Configure and publish the Android app         | [Android overview: zero to Google Play](./guides/google.md) |
| Set up push notifications                     | [Push notifications guide](./guides/push-notifications.md)             |

---

## Overview

```
 1. Accounts  →  2. Register the app  →  3. Push notifications  →  4. Build & sign  →  5. Upload & test  →  6. Publish
```

Steps 1 to 3 are done **once**. Steps 4 to 6 are repeated for **every release**.

---

## 1. Create the developer accounts (once)

You need one account per store.

**iOS: Apple Developer Program**
Create an Apple Account, enroll in the Apple Developer Program and pay the yearly membership. Enrollment can take from a few hours to a couple of days.
**Details:** [Apple: account registration](./guides/apple-account-registration.md)

**Android: Google Play Console**
Create a Google Play developer account, choose the account type, complete the public profile and pay the one-time fee. Google may ask for identity verification.
**Details:** [Google: account registration](./guides/google-account-registration.md)

---

## 2. Register the app (once)

**iOS**
Register an **App ID** (`com.fulbitoapp.app`) in Apple Developer → Certificates, Identifiers & Profiles → Identifiers. Then register your test iPhone in the **Devices** section, because Xcode needs at least one registered device to sign the app.
**Details:** [Apple: App ID and test device](./guides/ios-app-id-and-device.md)

**Android**
Create the **signing keystore** with `keytool`. This file proves that updates really come from us. It is created only once, must be backed up in a safe place and **never committed** to Git.
**Details:** [Google: create the signing keystore](./guides/android-keystore.md)

---

## 3. Set up push notifications (once)

Push notifications use **Firebase Cloud Messaging (FCM)**.

- **Android:** add the Android app in Firebase and download `google-services.json`.
- **iOS:** add the iOS app in Firebase and download `GoogleService-Info.plist`. Then create an **APNs key (.p8)** in Apple Developer, upload it to Firebase, enable the Push Notifications capability on the App ID and create the provisioning profile.

Do this **before** the first build, because the files and capabilities are part of the app.

**Details:** [Push notifications guide](./guides/push-notifications.md)

---

## 4. Prepare, build and sign (every release)

**Before building, increase the version numbers.**
In `app.json`, raise `ios.buildNumber` and `android.versionCode` for every upload. The stores reject a build whose number was already used. Change `version` too when users should see a new version.

**iOS**
Regenerate the native project (`npx expo prebuild --platform ios --clean`), open the `ios` folder in Xcode, check **Signing & Capabilities** (Team, Bundle ID, automatic signing), then run **Product → Archive**.
**Details:** [Apple: Xcode configuration](./guides/ios-xcode-configuration.md) · [Apple: version and build number](./guides/ios-version-and-build-number.md)

**Android**
Open the `android` folder in Android Studio, let Gradle sync, then **Build → Generate Signed Bundle / APK**. Choose **Android App Bundle (.aab)** for Google Play, select the keystore and the `release` variant.
**Details:** [Google: generate a signed build](./guides/android-signed-build.md)

> If the build fails, see the troubleshooting sections: [Apple](./guides/ios-troubleshooting.md) · [Google: missing `build.gradle`](./guides/android-gradle-troubleshooting.md)

---

## 5. Upload and test (every release)

**iOS: TestFlight**
In the Xcode **Organizer**, choose **Distribute App** to upload the archive to App Store Connect. Apple processes the build (about 15 to 30 minutes) and then you can assign it to testers in TestFlight.
**Details:** [Apple: create and distribute an archive](./guides/ios-archive-and-testflight.md)

**Android: Google Play testing track**
Upload the `.aab` generated in step 4 to the **Internal testing** track in the Google Play Console and add testers.
The generated file is located at `android/app/build/outputs/bundle/release/app-release.aab`.
**Details:** [Google: upload the .aab to Google Play](./guides/android-upload-to-google-play.md)

> **Push notifications on iOS only work on a real device**, never on the simulator. Test them from TestFlight or a development build installed on an iPhone.

---

## 6. Publish (every release)

Once the build is tested and approved by the team:

- **iOS:** in App Store Connect, select the processed build for a new version, complete the store listing and **Submit for Review**.
- **Android:** in the Google Play Console, promote the release from the testing track to **Production** and send it for review ([details](./guides/android-upload-to-google-play.md#6-promote-the-release)).

Both stores review the app before it goes live. This can take from a few hours to a few days.

---

## Release checklist

Copy this list for each release:

- [ ] `version`, `ios.buildNumber` and `android.versionCode` increased in `app.json`
- [ ] `google-services.json` and `GoogleService-Info.plist` are present in `apps/mobile/`
- [ ] `ios.entitlements.aps-environment` is correct for the build (`development` or `production`)
- [ ] iOS archive created and uploaded to App Store Connect
- [ ] Android `.aab` signed with the project keystore
- [ ] Push notification received on a real iPhone and on Android
- [ ] Build tested by at least one other person
- [ ] Store listing, screenshots and release notes ready
- [ ] Submitted for review

## Security reminders

- Never commit the keystore (`*.keystore`, `*.jks`), the APNs `.p8` key, passwords or `.env` files.
- Keep the keystore, its passwords and the `.p8` key in the team password manager. If the keystore is lost, the Android app cannot be updated.
