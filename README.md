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
- **Automatic advance**: enter what a member actually gives each day. Anything above the requirement shows as **Adv Submission**, and **Remarks** fills in automatically with how many weeks it covers (e.g. *Adv 4 Week (WK44–WK47) +5pcs*). It is automatically deducted from next week's quota; any leftover keeps rolling to the following weeks until it is used up. E.g. Ryu gives 1255 in WK43 (quota 250) → 1005 advance covers WK44, WK45, WK46 and part of WK47.
- **Start next week**: saves the current week to history, resets the daily numbers, carries the advance forward, and turns any shortfall into **Due Submission** (not for KIV, Leave or exempt members).
- **Class & Specialist** can be changed straight in the table (Class has suggestions, Specialist is a dropdown of the quota list). Quota and status recalculate immediately.
- **Tag pending on Discord**: sends a reminder to a Discord channel through a webhook, tagging every member still Pending (KIV/Leave excluded) and how many pcs each is short. Shows a preview first.
  - Webhook: Discord *Server Settings → Integrations → Webhooks → New Webhook* → choose channel → *Copy Webhook URL*, then paste it in the dialog (saved for next time).
  - To tag someone, add their **Discord User ID** via *Edit* (Discord *Settings → Advanced → Developer Mode*, then right-click the user → *Copy User ID*). Members without an ID are listed by name only.
  - Only the listed users are pinged — never @everyone, @here or roles.
- **History**: pick any past week from the Week dropdown to view it (read-only).
- Search, filters (family, specialist, status), and sorting by clicking a column header.
- Export the week to **CSV** (opens in Excel), **download/restore a JSON backup**, and **print**.

## Data storage

Data is saved in your browser's local storage, so it stays on the device and browser you use. To move it to another device or share it, use **More → Download backup** and then **Restore backup** on the other device. The backup also contains the Discord webhook URL; anyone who has that URL can post to your channel, so share backups only with people you trust.

The first time you open it, the app loads the Week 43 data from the original sheet. **More → Reset to sample data** brings that data back.

## Hosting on GitHub Pages

Repo **Settings → Pages → Deploy from a branch**, then pick the branch and the `/ (root)` folder. The site will be at `https://<user>.github.io/<repo>/`.
