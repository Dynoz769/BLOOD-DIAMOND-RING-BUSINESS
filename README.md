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
- **Exempt** members (e.g. Oyabun/Aneki) show N/A. **KIV** members are shaded dark and left out of the pending count.
- **Automatic advance**: enter what a member actually gives each day. Anything above the requirement shows as **Adv Submission** (with *Adv - WK..* in Remarks) and is automatically deducted from next week's quota; any leftover keeps rolling to the following weeks until it is used up. E.g. Ryu gives 1255 in WK43 (quota 250) → 1005 advance covers WK44, WK45, WK46 and part of WK47.
- **Start next week**: saves the current week to history, resets the daily numbers, carries the advance forward, and turns any shortfall into **Due Submission** (not for KIV or exempt members).
- **History**: pick any past week from the Week dropdown to view it (read-only).
- Search, filters (family, specialist, status), and sorting by clicking a column header.
- Export the week to **CSV** (opens in Excel), **download/restore a JSON backup**, and **print**.

## Data storage

Data is saved in your browser's local storage, so it stays on the device and browser you use. To move it to another device or share it, use **More → Download backup** and then **Restore backup** on the other device.

The first time you open it, the app loads the Week 43 data from the original sheet. **More → Reset to sample data** brings that data back.

## Hosting on GitHub Pages

Repo **Settings → Pages → Deploy from a branch**, then pick the branch and the `/ (root)` folder. The site will be at `https://<user>.github.io/<repo>/`.
