# iOS: From Zero to TestFlight

> **Document preview:** To preview this Markdown document in Visual Studio Code, press `Ctrl + Shift + V`.
>
> Back to the [publication overview](../README.md).

This is the **short version** of the iOS process. Follow the steps in order. Click **Details** on any step to open the full guide with screenshots.

```
1. Account  →  2. App ID + device  →  3. Push notifications  →  4. Xcode  →  5. Version  →  6. Archive  →  7. TestFlight
```

Steps 1 to 3 are done once. Steps 4 to 7 are repeated for every release.

## 1. Create the Apple Developer account (once)

Create an Apple Account, enroll in the **Apple Developer Program** (individual or organization) and pay the yearly membership. Approval is not always immediate.

**Details:** [Apple Developer account registration](./apple-account-registration.md)

## 2. Register the App ID and a test device (once)

In Apple Developer → Certificates, Identifiers & Profiles, register an **App ID** with the app's bundle ID (`com.fulbitoapp.app`) and register at least one **physical iPhone**. Without a registered device, Xcode cannot sign the app.

**Details:** [Register the App ID and a test device](./ios-app-id-and-device.md)

## 3. Configure push notifications (once)

Create an **APNs key (.p8)**, upload it to Firebase, enable the Push Notifications capability and create the provisioning profile.

**Details:** [Push notifications guide](./push-notifications.md)

## 4. Configure the project in Xcode (every release)

Regenerate the native project with `npx expo prebuild --platform ios --clean`, open the `ios` folder in Xcode and check **Signing & Capabilities**: Team, Bundle Identifier and automatic signing.

**Details:** [Xcode configuration](./ios-xcode-configuration.md)

## 5. Set the version and build number (every release)

Raise the **build number** for every upload (App Store Connect rejects repeated numbers) and the **version** when users should see a new release.

**Details:** [Version and build number](./ios-version-and-build-number.md)

## 6. Create the archive and upload it (every release)

In Xcode choose **Product → Archive**, then in the Organizer choose **Distribute App** to upload it to App Store Connect.

## 7. Test in TestFlight (every release)

Apple processes the build (about 15 to 30 minutes). Then assign it to testers or test groups in App Store Connect → TestFlight.

**Details (steps 6 and 7):** [Create an archive and upload to TestFlight](./ios-archive-and-testflight.md)

---

## Something failed?

See [iOS troubleshooting](./ios-troubleshooting.md), for example the `Undefined symbol: facebook::react::Sealable::Sealable()` error when archiving.

## All iOS guides

| Guide                                                             | Topic                                        |
| ----------------------------------------------------------------- | -------------------------------------------- |
| [apple-account-registration.md](./apple-account-registration.md)   | Apple Developer Program enrollment           |
| [ios-app-id-and-device.md](./ios-app-id-and-device.md)             | App ID and test device                       |
| [push-notifications.md](./push-notifications.md)                   | Firebase, APNs key, certificates, profiles   |
| [ios-xcode-configuration.md](./ios-xcode-configuration.md)         | Prebuild, signing and capabilities           |
| [ios-version-and-build-number.md](./ios-version-and-build-number.md) | Version and build number rules             |
| [ios-archive-and-testflight.md](./ios-archive-and-testflight.md)   | Archive, upload and TestFlight               |
| [ios-troubleshooting.md](./ios-troubleshooting.md)                 | Known build errors                           |
