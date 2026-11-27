# Android: Create the Signing Keystore

> Back to the [Android overview](./google.md).

To create the keystore that will be used to sign the Android application, run the following command in the terminal:

```bash
keytool -genkeypair \
  -v \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias FulbitoApp \
  -keystore fulbito.keystore
```

The command will ask you to enter:

- A keystore password.
- Your name and organizational information.
- A password for the key alias.

This process should normally be completed only once. The generated keystore must be used for every release of the same application because Android updates must be signed with the correct signing identity.

> **Important:** Store the keystore, alias, and passwords in a secure password manager or secrets-management system. Never commit the keystore or its credentials to the Git repository, and never include passwords in this documentation.

> **Warning:** Losing the keystore or its credentials may prevent the team from publishing future application updates. Keep at least one secure backup managed by the project administrators.

Add the keystore filename to `.gitignore`:

```gitignore
*.keystore
*.jks
```
