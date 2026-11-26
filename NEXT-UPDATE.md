# Next update notes (Peekaboom)

Ideas and to-dos saved for the next app update (1.0.1 and later).

## Look and feel
- Pick a new font for the whole app (the in-game font will change; the intro letters use Fredoka).
- Make the whole app follow the purple/black theme with pink and blue accents, like the intro.
- Home title "PEEKABOOM" now uses the pink → purple → blue blend. Done in 1.0.1.

## Lobby
- Move the "Power-ups on the map" on/off switch to page 1, right below the 6 modes (where the old mode descriptions were), so mode and power-ups are picked together.
- Remove that switch from page 2 (map & settings). The detailed power-up settings can stay in Advanced.
- Put Teams, Seekers count, Randomize teams and Secret random roles on one horizontal row next to Players (small toggles/chips) to save vertical space.
- Let players fix their name in the lobby: a small ✏️ pencil next to your name in the players list, tap to edit, everyone sees the new name. No need to leave the game.
- Goal: no scrolling. Page 1 should fit on one phone screen with the Next button already visible at the bottom when it opens; page 2 the same with Start game at the bottom. Keep the button pinned to the bottom even as players join.

## Intro
- Letters start 20% in from each side, shake, lean back to build momentum, then slam together. Done in 1.0.1.
- "Peekaboo!" voice: DONE. Sergio's own recording (assets/peekaboo.mp3) is a group version made from his voice (8 layered copies); plays once, 0.05s before the crash lands. Could swap in a kids' group recording later.
- Optional: soft music while waiting in the lobby.

## Store and money
- Turn on the real $2.99 unlock (Paid Apps agreement + bank and tax info, in-app purchase, RevenueCat keys).
- iPad support (needs iPad screenshots).
- EU release (needs trader status: public address, phone, email).

## Apple / Xcode
- Apple email: new apps and updates must be built with the newer Xcode / iOS SDK (iOS 27 SDK from April 2027).
  The iPhone build workflow uses the latest stable Xcode on GitHub, so it should pick this up on its own once GitHub's Mac machines have it.
  Check the build log for the Xcode version before submitting after that date.

## Game mode ideas (from Sergio, Nov 22)
- Points mode: teams can mix hiders and seekers. Seekers score for tags, hiders score for time hidden; team with the most points wins.
- "Last one found" mode: the last hider found wins (maybe also points for how long each person lasted).
- Teams now: tap a team to join it, ✏️ renames (host), tapping a player's team tag opens a team list. Only hiders are on teams.
- Secret teams (Sergio): with Secret roles + Teams, teams mix secret hiders and seekers. You can't tag your own teammate; the team that gets the other teams out first wins.
- Danger meter (built Nov 25, in TestFlight build 43+, not yet on the App Store): host switch in Game settings; hiders see 0-4 red bars for the closest seeker (160/100/50/25 m), phone buzzes at 3-4 bars.
- Idea (Sergio): "Sound bomb" power-up that makes other players' phones ring/make noise.
