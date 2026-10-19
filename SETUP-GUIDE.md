# Serena Executive Report: free setup (Windows, about 30 minutes, once)

You need: a Gmail address, Chrome or Edge. Everything below is free and needs no credit card.

## Part 1: The database (Supabase)
1. Go to supabase.com > Start your project > sign in (GitHub or email).
2. New project. Name: `serena-report`. Database password: type any strong one and save it somewhere. Region: the closest to Pakistan you can see. Create. Wait about 2 minutes.
3. Left menu > **SQL Editor** > New query. Open `setup.sql` from this folder in Notepad, copy everything, paste, click **Run**. It should say "Success".
4. Left menu > **Authentication** > Users > **Add user** > Create new user. Type YOUR email and a strong password, tick **Auto Confirm User**, Create.
5. Authentication > Sign In / Providers (or Settings): switch OFF **"Allow new users to sign up"** so only people you add can enter.
6. SQL Editor > New query. Open `make-admin.sql` in Notepad, replace `PUT_YOUR_EMAIL_HERE` with your email (keep the quotes), paste, **Run**. You are now the only admin.
7. Project Settings > **API** (or "API Keys"). Copy two things: the **Project URL** and the **anon / publishable key** (the long one). Keep this page open.

## Part 2: Put the two values in the app
8. Open `config.js` in Notepad. Replace `PASTE_YOUR_PROJECT_URL_HERE` with the Project URL and `PASTE_YOUR_ANON_PUBLIC_KEY_HERE` with the key. Keep the quotes. Save.

## Part 3: The website (GitHub Pages, free)
9. github.com > sign up / sign in > **New repository**. Name: `serena-report`. Choose **Public** (free Pages needs this; the repository contains no financial data, the numbers live only in Supabase behind a login). Create.
10. Click **uploading an existing file**. Drag in EVERYTHING from this folder (including the `vendor` folder). Click **Commit changes**.
11. Repository > **Settings** > **Pages** > Source: **Deploy from a branch** > Branch **main** / **(root)** > Save. After 1 to 2 minutes the page shows your permanent link: `https://YOURNAME.github.io/serena-report/`

## Part 4: First use
12. Open the link, sign in with your admin email. Go to **Admin**, upload your Daily Executive Report (and the ageing file). Read the ✓ / ⚠ list.
13. Add each senior: Supabase > Authentication > Users > Add user (tick Auto Confirm). Send them the link, email and password. They can only look.

## Every day
Option A (10 seconds): paste data in Excel, save, open the app > Admin > Upload.
Option B (automatic, Chrome or Edge on your computer): Admin > **Choose Excel file and start**, pick your report file once. Keep that tab open. Each time you save the file in Excel, all dashboards update by themselves. If Excel blocks reading the file, the app says so and you use Option A.

## Install on phones
Android (Chrome): open the link > menu (three dots) > Install app.
iPhone (Safari): open the link > Share > Add to Home Screen.
Install once; it stays signed in and updates live whenever you upload.

## Good to know
Free Supabase projects pause after a week without use. Daily use prevents it. If it ever pauses, press Restore in Supabase.
