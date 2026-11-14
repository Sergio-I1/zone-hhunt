# Getting Zone Hunt onto iPhones without a Mac

GitHub rents a Mac for a few minutes, builds the app there, and sends it to Apple.
You install it on your iPhone through Apple's TestFlight app.

Status: the project and build script are written, but nobody has run the build yet.
Expect the first run or two to fail on something small. Send the error log and it gets fixed.

## One-time setup

1. **Join the Apple Developer Program** at developer.apple.com/programs. Approval can take a day or two.
2. **Register the app ID.** developer.apple.com/account -> Identifiers -> + -> App IDs -> App.
   Bundle ID: `io.github.sergioi1.zonehunt` (Explicit). No capabilities need ticking.
3. **Create the app record.** appstoreconnect.apple.com -> Apps -> + -> New App.
   Platform iOS, name "Zone Hunt" (or anything free), the bundle ID from step 2, any SKU such as `zonehunt1`.
4. **Create an API key** so GitHub can sign in as you. App Store Connect -> Users and Access -> Integrations -> App Store Connect API -> +.
   Name it "GitHub", access "App Manager". Download the `.p8` file (you only get one chance). Note the **Key ID** and the **Issuer ID** shown on that page.
5. **Find your Team ID.** developer.apple.com/account -> Membership details. It is 10 letters and numbers.
6. **Give GitHub the four values.** In this repo: Settings -> Secrets and variables -> Actions -> New repository secret.

   | Secret name | Value |
   |---|---|
   | `APPLE_TEAM_ID` | the Team ID from step 5 |
   | `ASC_KEY_ID` | the Key ID from step 4 |
   | `ASC_ISSUER_ID` | the Issuer ID from step 4 |
   | `ASC_KEY_P8` | the whole text inside the `.p8` file, including the BEGIN and END lines |

   Never put the `.p8` file itself in the repo. The repo is public.

## Every time you want a new iPhone build

1. Repo -> Actions -> "iPhone build" -> Run workflow.
2. Wait about 15 minutes. A green tick means Apple has the build.
3. In App Store Connect -> your app -> TestFlight, the build shows up after Apple finishes processing it.
4. Install the TestFlight app on your iPhone, add yourself as a tester, and install Zone Hunt from there.

## What is different in the iPhone app

- Location keeps working with the phone locked, until the game ends or you leave it.
- iOS will ask for location twice: first "While Using", later "Always". Players need to pick Always for locked-phone tracking.
- The game is stored inside the app. Changes pushed to the website do not reach the iPhone app until you run a new build.
