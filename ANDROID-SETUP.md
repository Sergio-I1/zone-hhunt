# Getting Zone Hunt onto Google Play as a real Android app

GitHub builds the app on its own computers. You never need Android Studio.

The real app keeps sharing location with the phone locked (a notification shows while it does),
which the old website-wrapper package from PWABuilder could not do.
Use this build instead of `Zone Hunt.aab` from the PWABuilder zip.

## One-time setup: give GitHub your signing key

Google needs every update signed with the same key. Use the key from the PWABuilder zip you already have.

1. Make the key into text GitHub can store. On Windows, open PowerShell in the folder with `signing.keystore` and run:

   ```
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("signing.keystore")) | Set-Clipboard
   ```

   That copies a long block of text.
2. In this repo: Settings -> Secrets and variables -> Actions -> New repository secret. Add four:

   | Secret name | Value |
   |---|---|
   | `ANDROID_KEYSTORE_B64` | paste the text from step 1 |
   | `ANDROID_KEYSTORE_PASSWORD` | the keystore (store) password in `signing-key-info.txt` |
   | `ANDROID_KEY_ALIAS` | the key alias in `signing-key-info.txt` |
   | `ANDROID_KEY_PASSWORD` | the key password in `signing-key-info.txt` |

   Never put `signing.keystore` or `signing-key-info.txt` in the repo. The repo is public.

## Every time you want a new Android build

1. Repo -> Actions -> "Android build" -> Run workflow.
2. Wait about 10 minutes for the green tick, open the run, and download the file under "Artifacts".
3. Inside it:
   - `app-release.aab` is what you upload to Google Play.
   - `app-release.apk` installs straight onto an Android phone for testing.

Without the secrets, the build still makes `app-debug.apk` for testing on a phone.

## App ID

The app's package name is `io.github.sergioi1.zonehunt`, the same as the iPhone app.
It is permanent once uploaded to Google Play.
