# Atelier JK&WA — Admin Guide

This guide explains how to update the website yourself: projects, the large photos at the top of the home page, and your contact details. You don't need any technical knowledge. Every change shows on the website as soon as you press **Save**.

---

## Logging in

1. Go to **your website address + `/admin`** (for example `https://jkwa.netlify.app/admin`).
2. Enter your email and password, then press **Log in**.
3. When you're finished, press **Sign out** (top right, or in the menu on a phone).

The admin works on a computer, a tablet and a phone.

### Forgot your password?

1. On the login page, press **Forgot password?**
2. Enter your email and press **Send reset link**.
3. Open the email and click the link. Use the **same browser** you asked from. Each link works only once.
4. Choose a new password (at least 10 characters), type it twice, and press **Save new password**.

If the link says it has expired, just ask for a new one.

---

## The dashboard

The first page you see shows:

- how many projects you have (visible and drafts)
- how many photos are on the home page
- **photo storage**: how much of your 1 GB of photo space is used. It turns amber when it's over 70% full and red over 90%. If it's getting full, remove photos you no longer need.

---

## Projects

### Adding a project

1. Go to **Projects** and press **Add project**.
2. Fill in the **Title**, **Category** (Residential or Commercial) and **Location**, then press **Create and add photos**.
3. You're now on the project's page. It's a **draft**: only you can see it.
4. Add the **Cover photo** (required). This is the large photo at the top of the project page, also used on the Projects page and the home page.
5. Fill in whatever else you'd like (all optional):
   - **Project facts**: property type, size, duration, scope, year. Anything left empty is hidden.
   - **Story**: a heading and some text. Press Enter twice to start a new paragraph. Web addresses become links automatically.
   - **Before & After**: add **both** photos to show the slider. With only one photo, the slider won't show and you can't save.
   - **Gallery photos**: add as many as you like (see "Photo tips" below).
6. Press **Preview** to see the page exactly as visitors will, before anyone else can.
7. When you're happy, switch on **Visible on website** and press **Save**.

> Photos are saved as soon as they finish uploading. Everything else (text, switches, photo descriptions, gallery order) is saved when you press **Save**. If you try to leave with unsaved changes, the admin will warn you.

### Editing a project

Go to **Projects**, press **Edit** next to the project, make your changes and press **Save**.

The **Page address** is the end of the project's web link (for example `…/projects/ceylon-road`). It's created from the title, and you rarely need to change it. If you change it on a visible project, links people have saved or shared will stop working.

### Showing a project on the home page

Switch on **Show on home page** and press **Save**. Its cover photo then appears in the Portfolio carousel on the home page (only while the project is visible).

### Changing the order

On the **Projects** page, drag a project up or down by the **⋮⋮ handle** on the left. The order saves automatically. This is the order on the Projects page and on the home page.

On a phone, press and drag the handle. With a keyboard, tab to the handle, press Space, use the arrow keys, then press Space again.

### Hiding a project

Open the project, switch off **Visible on website** and press **Save**. It disappears from the website straight away but stays in the admin as a draft, so you can bring it back later.

### Deleting a project

Open the project and scroll to **Danger zone** at the bottom. Press **Delete project**, type the project's title to confirm, then press **Delete for good**. The project and all its photos are removed permanently. If you might want it again, hide it instead.

---

## Photo tips

- **Any normal photo works**: JPG, PNG or WebP. Photos are automatically resized and compressed before uploading, so you don't need to shrink them first (up to 30 MB each).
- **iPhone photos**: if a photo is refused as "format isn't supported", export or share it as JPG first (or set the iPhone camera to "Most Compatible").
- **Wide vs tall**: each gallery photo shows a small **Wide** or **Tall** tag. The website arranges the gallery automatically: wide photos fill a whole row, and tall photos sit side by side in pairs. Just put them in the order you'd like people to see them.
- **Order**: drag photos by their handle to reorder, then press **Save**.
- **Descriptions**: the small text box under each photo describes it for people using screen readers, and helps Google. A few words is enough, e.g. "Living room with timber screens".
- **Removing**: press the **×** on a photo. It's deleted straight away.
- **Cover photo**: use a wide (landscape) photo. It can be replaced but not removed.

---

## Hero slides (the large photos at the top of the home page)

Go to **Hero Slides**.

- **Add**: press **Add slides** (or drag photos onto the box). Wide landscape photos work best, at least 2000 pixels wide.
- **Replace**: press **Replace** on a slide to swap its photo.
- **Reorder**: drag by the handle, then press **Save**. The first slide loads first, so pick your strongest photo.
- **Describe**: type a short description under each slide, then press **Save**.
- **Remove**: press the **×**. At least one slide must always remain.

---

## Settings (contact details, buttons and social media)

Go to **Settings**, change what you need and press **Save**. The footer, contact section and buttons update everywhere on the website.

- **Contact**: contact person, phone, fax, email, opening hours, and the address (3 lines).
- **Buttons**: the links behind **Get Free Booklet** and **Project Questionnaire**. Use **Test link ↗** to check a link opens correctly.
  - If you paste a Google Drive link that ends in `/view`, you'll be offered **Convert to direct download link**, so visitors download the booklet straight away instead of seeing a preview page.
- **Social media**: paste the full link to each page. Leave a box empty to hide that icon.
- **Company**: company name and UEN, shown in the footer.

Links must start with `https://`. Phone and fax can contain only digits, spaces and `+`.

---

## For the website owner only: managing admin logins

Only people listed as admins can log in and change the website. Public sign-ups are switched off.

### Add an admin

1. Supabase → **Authentication → Users → Add user → Create new user**.
   - Enter their email and a strong temporary password.
   - Tick **Auto Confirm User**.
2. Supabase → **SQL Editor**, run (with their email):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'their.email@example.com'
   on conflict (user_id) do nothing;
   ```

3. Send them the admin address and ask them to use **Forgot password?** to choose their own password.

Someone who can log in but isn't in the admins list only sees "This account doesn't have admin access".

### Remove an admin

In the **SQL Editor**:

```sql
delete from public.admins where email = 'their.email@example.com';
```

This removes their editing rights straight away. To remove their login entirely, also delete the user in **Authentication → Users**.

### Password reset links

These only work if Supabase → **Authentication → URL Configuration** has:

- **Site URL:** the live website address
- **Redirect URLs:** `http://localhost:3000/**`, `https://develop--jkwa.netlify.app/**`, `https://jkwa.netlify.app/**`, and later the client's own domain (e.g. `https://www.example.com/**`) when it goes live
