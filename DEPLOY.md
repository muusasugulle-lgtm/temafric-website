# Putting temafric.com online (Vercel + GoDaddy)

This is the same setup as the TEMA Group website.

## Step 1: Import the project in Vercel

1. Go to **vercel.com** and log in with **Continue with GitHub**, using the same account as TEMA Group.
2. Click **Add New → Project**.
3. Find **muusasugulle-lgtm/temafric-website** and click **Import**.
   - If it is not listed, click **Adjust GitHub App Permissions** and give Vercel access to `temafric-website`.
4. Settings:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: leave **empty**
   - Output Directory: leave **empty**
5. Click **Deploy**. After about a minute you get a test address like `temafric-website.vercel.app`.

## Step 2: Add the domain in Vercel

1. In the project, open **Settings → Domains**.
2. Add `temafric.com`, then add `www.temafric.com`.
3. Vercel shows the DNS records to create. They are usually:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 76.76.21.21            |
| CNAME | www  | cname.vercel-dns.com   |

Use the exact values Vercel shows you if they differ.

## Step 3: Point the domain in GoDaddy

1. GoDaddy → **My Products** → temafric.com → **DNS**.
2. **A record, Name `@`:** edit it and set the value to Vercel's IP. If there are several `@` A records, delete the extra ones so only Vercel's remains.
3. **CNAME record, Name `www`:** edit it and set the value to `cname.vercel-dns.com`.
4. **Do NOT touch the MX, TXT (SPF) or other email records.** They keep sales@temafric.com working.
5. Save. The site usually appears within 10–60 minutes, sometimes up to 24 hours. Vercel adds HTTPS automatically.

## Step 4: Activate the quote form (one time)

1. Open **www.temafric.com/contact.html** and send one test request.
2. FormSubmit sends an **activation email** to **sales@temafric.com**. Open it and click **Activate Form**.
3. From then on, every quote request arrives in that mailbox. Reply to the email to answer the client directly.

## Updating the site later

Change the files in this repository on GitHub, or ask Claude to. Vercel publishes each change automatically within about a minute.
