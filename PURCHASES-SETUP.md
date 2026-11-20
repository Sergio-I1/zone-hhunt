# Turning on the $2.99 full unlock

Classic and Manhunt are free. The full unlock adds Infection, Last Zone Standing, Freeze Tag, Sardines and power-ups.
Only the host needs it: everyone in their games gets it too.

Purchases go through RevenueCat, a free service (until you make a lot of money) that handles
the App Store and Google Play for you, so the app has one piece of purchase code for both.

Do these after the app exists in each store (at least in closed testing / TestFlight).

## 1. Make the $2.99 item in each store

**Google Play Console** -> your app -> Monetize -> Products -> In-app products -> Create product
- Product ID: `zonehunt_unlock`
- Name: Full unlock
- Description: Every game mode and power-ups for the games you host
- Price: $2.99 -> Save -> Activate

(Google asks for a payments profile with your bank and tax info the first time.)

**App Store Connect** -> your app -> Monetization -> In-App Purchases -> +
- Type: **Non-Consumable**
- Product ID: `zonehunt_unlock`
- Reference name: Full unlock, price $2.99, add the same display name and description
- Also sign the **Paid Apps agreement** under Business, with bank and tax info.

## 2. Set up RevenueCat

1. Sign up at revenuecat.com and create a project called Zone Hunt.
2. Add an **App Store** app (bundle ID `io.github.sergioi1.zonehunt`) and a **Play Store** app (package `io.github.sergioi1.zonehunt`).
   RevenueCat walks you through linking each store; follow its instructions on screen.
3. **Products**: add `zonehunt_unlock` for both apps.
4. **Entitlements**: create one called `premium` and attach both products.
5. **Offerings**: open the `default` offering, add a package (Lifetime) and attach both products.
6. **API keys**: copy the two **public** app keys (one starts with `appl_`, the other with `goog_`).

## 3. Send the two public keys to Claude

They go into `index.html` on the line `const RC_KEYS = {ios: "", android: ""};`.
Public keys are meant to be inside the app, so it's fine that the repo is public.
Never share the secret keys that start with `sk_`.

Then run a new Android build and iPhone build. Test buying with a test account:
Google Play license testers (Play Console -> Settings -> License testing) and Apple sandbox testers
(App Store Connect -> Users and Access -> Sandbox) are not charged.
