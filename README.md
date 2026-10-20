# Blood Diamond Ring Business – Weekly Submission System

A browser-based version of the weekly submission sheet. No install and no server: open `index.html` in a browser, or host the repo on GitHub Pages.

## Features

- **Member sheet** with the same columns as the Excel sheet: No, Hierarchy, Family, Class, Specialist, Namelist, Mon/Tue/Wed, Total, Status, Pending Qty, Adv Submission, Due Submission, Remarks.
- **Automatic calculation** of totals, status (Completed / Pending / N/A) and pending qty, with a red bar showing how much is still owed.
- **Quotas per specialist** (editable under *Quotas*):
  - Shooter = 150 pcs/week
  - Melee = 250 pcs/week
  - Melee & Shooter = 100 pcs/week
  - Farming = 250 pcs/week
- **Exempt** members (e.g. Oyabun/Aneki) show N/A.
- **KIV / Leave**: pick it from the Status dropdown on each row. A KIV (dark) or Leave (blue) member has no quota that week. They are not counted as pending, not tagged on Discord and get no Due Submission, and their advance stays whole. Set it back to *Active* when they return.
- **Automatic advance**: enter what a member actually gives each day. Anything above the requirement shows as **Adv Submission**, and **Remarks** fills in automatically with how many weeks it covers (e.g. *Adv 4 Week (WK44–WK47) +5pcs*). It is automatically deducted from next week's quota; any leftover keeps rolling to the following weeks until it is used up. E.g. Ryu gives 1255 in WK43 (quota 250) → 1005 advance covers WK44–WK47 in full, with 5 pcs left for WK48.
- **Start next week**: saves the current week to history, resets the daily numbers, carries the advance forward, and turns any shortfall into **Due Submission** (not for KIV, Leave or exempt members).
- **Class & Specialist** can be changed straight in the table (Class has suggestions, Specialist is a dropdown of the quota list). Quota and status recalculate immediately.
- **Discord reminder**: builds the family's reminder message for the members still Pending (KIV/Leave excluded) and lets you **Copy message** to paste into Discord yourself:
  ```
  ⛩️ HOKAI FAMILY BUSINESS - WK43 (Day3 - Final Day) ⛩️

  Dear @NAKAMA @HYOUKA ,

  Regarding the Blood Ring submission status, please ensure your submission is completed by 11:59 PM (Wednesday) at the latest.

  Kindly inform us if you face any difficulties nor issues or need more time completing this week's task. Any pending submissions will be carried forward to the following week.

  @HK | Ryouta @HK | Takeru Kurogawa (PEMANGGNG) ... (pending members)
  ```
  - Names are written as **"HK | " + name** (prefix can be changed). If someone's Discord name is different, set it via *Edit → Discord name* (e.g. `HK | JIN MORI ( MONKEY KING )`); the names from the WK43 reminder are already filled in.
  - Pick Day1 / Day2 / Day3 - Final Day (today's day is chosen automatically). The title and the "Dear" tags can be changed, and you can still edit the text before copying.
  - To make a tag really ping, add the member's **Discord User ID** via *Edit* (Discord *Settings → Advanced → Developer Mode*, then right-click the user → *Copy User ID*). The message then contains `<@ID>`, which Discord turns into a mention when you send it. For roles, put `<@&RoleID>` in the "Dear" tags. Without an ID the name is written as plain text and does not ping.
  - **Set Discord IDs** (inside the Discord reminder) lists every member so all IDs and Discord names can be filled in at once. Pasted plain text like `@HK | Ryouta` does **not** ping in Discord; only `<@ID>` does.
  - Optional: paste a channel webhook URL to send it straight from the app. Only the users/roles in the message are pinged, never @everyone or @here.
- **History**: pick any past week from the Week dropdown to view it (read-only).
- Search, filters (family, specialist, status), and sorting by clicking a column header.
- Export the week to **CSV** (opens in Excel), **download/restore a JSON backup**, and **print**.

## Data storage

**Without Firebase** (default, `js/firebase-config.js` is `null`): data is saved in the browser's local storage, so it stays on that device and browser. Use **More → Download backup / Restore backup** to move it. The backup also contains the Discord webhook URL; anyone who has that URL can post to your channel, so share backups only with people you trust.

**With Firebase** (shared online database): admins log in with email + password, and every change syncs live to everyone who has the page open. The top bar shows the status (● Online / Saving / Not saved).

The first time you open it, the app loads the Week 43 data from the original sheet. **More → Reset to sample data** brings that data back. The same Week 43 data is also in `data/week-43.json`, which can be loaded with **More → Restore backup**.

### Firebase setup (one time, free)

1. Go to https://console.firebase.google.com → **Add project**. Google Analytics is not needed.
2. **Build → Realtime Database → Create database**. Pick the nearest location (e.g. Singapore) and start in **locked mode**.
3. **Rules** tab: paste the contents of `database.rules.json` → **Publish**.
4. **Build → Authentication → Get started → Email/Password → Enable**. Then **Users → Add user** for each admin and copy their **User UID**.
5. Back in **Realtime Database → Data**: add a key `admins`, and under it add each admin UID with the value `true`:
   ```
   admins
     ├─ AbCdEf123...: true
     └─ XyZ987...:   true
   ```
6. **Project settings (⚙️) → General → Your apps → Web (</>)** → register the app → copy the `firebaseConfig` object into `js/firebase-config.js` (replace `null`). Include `databaseURL`.
7. **Authentication → Settings → Authorized domains**: add `<user>.github.io` when hosting on GitHub Pages.

The first admin who logs in to an empty database uploads the data from their browser. Firebase web config values are not secret; access is protected by the login and the rules (only UIDs under `admins` can read or write).

After changing files, run `python3 tools/build_single.py` to rebuild the single-file `blood-diamond-tracker.html`.

## Hosting on GitHub Pages

Repo **Settings → Pages → Deploy from a branch**, then pick the branch and the `/ (root)` folder. The site will be at `https://<user>.github.io/<repo>/`.
