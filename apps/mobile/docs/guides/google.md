# Android: From Zero to Google Play

> **Document preview:** To preview this Markdown document in Visual Studio Code, press `Ctrl + Shift + V`.
>
> Back to the [publication overview](../README.md).

This is the **short version** of the Android process. Follow the steps in order. Click **Details** on any step to open the full guide with screenshots.

```
1. Account  →  2. Keystore  →  3. Push notifications  →  4. Version  →  5. Signed build  →  6. Upload to Google Play
```

Steps 1 to 3 are done once. Steps 4 to 6 are repeated for every release.

## 1. Create the Google Play Console account (once)

Choose the account type, enter the developer name, complete the public profile, accept the terms and pay the one-time registration fee. Google may ask for identity verification before you can publish.

**Details:** [Google Play developer account registration](./google-account-registration.md)

## 2. Create the signing keystore (once)

Run `keytool` to create `fulbito.keystore`. This file proves that updates come from us. Back it up in the team password manager and **never commit it**: if it is lost, the app cannot be updated.

**Details:** [Create the signing keystore](./android-keystore.md)

## 3. Configure push notifications (once)

Add the Android app (`com.fulbitoapp.app`) in Firebase and download `google-services.json` into `apps/mobile/`.

**Details:** [Push notifications guide](./push-notifications.md)

## 4. Raise the version (every release)

In `app.json`, increase `android.versionCode`. Google Play rejects an upload whose `versionCode` was already used. Change `version` too when users should see a new release.

## 5. Generate a signed build (every release)

Open the `android` folder in Android Studio, let Gradle sync, then **Build → Generate Signed Bundle / APK**. Choose **Android App Bundle (.aab)**, select the keystore and the `release` variant. The file is created at `android/app/build/outputs/bundle/release/app-release.aab`.

**Details:** [Generate a signed build](./android-signed-build.md)

## 6. Upload to Google Play (every release)

Upload the `.aab` to a testing track in the Google Play Console, add testers and, when approved, promote the release to Production.

---

## Something failed?

If Android Studio reports a missing `build.gradle` or the project does not sync, see [Gradle troubleshooting](./android-gradle-troubleshooting.md).

## All Android guides

| Guide                                                                     | Topic                                  |
| ------------------------------------------------------------------------- | -------------------------------------- |
| [google-account-registration.md](./google-account-registration.md)         | Google Play Console account            |
| [android-keystore.md](./android-keystore.md)                               | Signing keystore                       |
| [push-notifications.md](./push-notifications.md)                           | Firebase and `google-services.json`    |
| [android-signed-build.md](./android-signed-build.md)                       | Signed `.aab` / APK                    |
| [android-gradle-troubleshooting.md](./android-gradle-troubleshooting.md)   | Missing `build.gradle`, Gradle sync    |
