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
- **Start next week**: saves the current week to history and resets the daily numbers. It also carries balances forward:
  - Pieces above the requirement, plus Adv Submission, become **Credit B/F** for next week.
  - A shortfall becomes **Due Submission** for next week (not for KIV or exempt members).
- **History**: pick any past week from the Week dropdown to view it (read-only).
- Search, filters (family, specialist, status), and sorting by clicking a column header.
- Export the week to **CSV** (opens in Excel), **download/restore a JSON backup**, and **print**.

## Data storage

Data is saved in your browser's local storage, so it stays on the device and browser you use. To move it to another device or share it, use **More → Download backup** and then **Restore backup** on the other device.

The first time you open it, the app loads the Week 43 data from the original sheet. **More → Reset to sample data** brings that data back.

## Hosting on GitHub Pages

Repo **Settings → Pages → Deploy from a branch**, then pick the branch and the `/ (root)` folder. The site will be at `https://<user>.github.io/<repo>/`.
