# Zone Hunt tracker (Google Sheet)

Counts website visits and games started, with a count for each game mode.
Nothing personal is sent: no names, no locations, no photos. Each device gets a random id so the sheet can count different devices.

## Set it up (about 5 minutes)

1. Go to **sheets.new** to make a new Google Sheet. Name it "Zone Hunt tracker".
2. In the sheet: **Extensions → Apps Script**.
3. Delete what is in the editor, paste in all of `tracker/Code.gs`, and press **Save** (the disk icon).
4. In the dropdown at the top, pick **setup**, then press **Run**.
   Google asks for permission: **Review permissions** → pick your account → "Google hasn't verified this app" → **Advanced** → **Go to (your project) (unsafe)** → **Allow**.
   That warning shows for every script you write yourself. It only gives the script access to this sheet.
5. Press **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Press **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. Check it: open that URL in a browser. It should say "Zone Hunt tracker is running."
7. Put the URL in `index.html` on the line `const TRACK_URL = "";`, between the quotes.

## What the sheet shows

- **Dashboard tab:** website visits, different devices, games started, the last 7 days, the most played mode,
  a row for each game mode (games, average players, last played), the last 14 days, and a bar chart.
- **Events tab:** one row per visit or game start. The Dashboard counts from this tab.

Games started in Test mode are recorded but left out of the Dashboard counts.

## If you change the script later

Press **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**.
Otherwise the old version keeps running. The link stays the same.
