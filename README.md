# Zone Hunt

Real-life hide-and-seek on a live map. One person creates a game, everyone else joins with the 6-letter code.

- Hider and seeker roles, five game modes including Freeze Tag
- Lives: a tag costs one life and gives the hider time to escape
- Power-ups on the map: Extra life, Jammer, Ghost, Rat, Decoy, Name swap
- Time limits and a zone that shrinks during the game
- Each phone uses its own GPS; messages are encrypted with the game code

## Play

Open the GitHub Pages link for this repo on each phone, allow location, and keep the screen on while playing.

To try it at a desk, tick "Test mode" on the home screen and open the page in two browser tabs.

The whole app is `index.html`. No build step and no server to set up.

## Versions

**v3**
- Power-up limit: a set number are always in play (on the map plus held). When one is used, a new one appears.
- Stacking switch: hiders can hold several power-ups, or only one at a time.
- Lobby split into main settings and Advanced settings.
- Caught hiders drop any power-ups they were holding.

**v2**
- Lives with escape time after a tag, and an adjustable tag range.
- Freeze Tag mode with unfreeze codes.
- Power-ups: Extra life, Jammer, Ghost, Rat, Decoy, Name swap.
- Toggle for names on pings.
- Secret random roles with a reveal screen at game start.
- Installable app (icon, manifest, offline support).

**v1**
- Multiplayer over game codes, real GPS, live street map.
- Hider and seeker roles, Classic, Infection, Manhunt and Last Zone Standing modes.
- Time limits and a shrinking zone.
