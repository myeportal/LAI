# Leashing AI site

Static Vercel-ready sales page for **Leashing AI**, now scaffolded for private ebook delivery by email after purchase.

## Included
- `index.html` / `thank-you.html` — public sales and post-purchase pages
- `styles.css` / `script.js` — site styling and lightweight front-end behavior
- `public/assets/*` — cover art and VSL assets
- `ebook/LeashingAI-ebook.pdf` — local source/build copy of the ebook
- `private_assets/LeashingAI-ebook.pdf` — non-public copy streamed by the download API
- `api/stripe-webhook.js` — Stripe webhook handler that sends the delivery email
- `api/download.js` — signed private download endpoint
- `lib/delivery.js` — token signing and PDF path helpers
- `.env.example` — required environment variables

## What changed
- The thank-you page no longer links directly to the PDF.
- Buyers are now told to check email for delivery from `order@leashingai.com`.
- The public `public/ebook/LeashingAI-ebook.pdf` file was moved to `private_assets/LeashingAI-ebook.pdf` so it is no longer directly exposed by the site.
- Vercel is configured to bundle that private PDF into the download function.

## Environment variables
Copy `.env.example` to your local env file or Vercel project settings and fill in:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `DOWNLOAD_TOKEN_SECRET`
- `SITE_URL`
- `RESEND_FROM_EMAIL` (defaults to `order@leashingai.com`)
- `DOWNLOAD_LINK_TTL_HOURS` (defaults to `72`)
- `EBOOK_PDF_PATH` (optional override)

## Vercel + Stripe setup
1. Run `npm install` in this folder so `stripe` and `resend` are available.
2. Deploy the repo to Vercel.
3. In Vercel, set the environment variables from `.env.example`.
4. In Resend, verify the `leashingai.com` sending domain and make sure `order@leashingai.com` is allowed.
5. In Stripe, keep the success URL pointed to `/thank-you.html`.
6. In Stripe, add a webhook endpoint for `https://YOUR-DOMAIN/api/stripe-webhook` and subscribe to `checkout.session.completed`.
7. Copy the Stripe webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Notes / limitations
- This scaffold sends the delivery email only after Stripe reports a paid `checkout.session.completed` event.
- Download links are signed and expire automatically, but they are still bearer links. Anyone with the live link can use it until it expires.
- Duplicate webhook deliveries are not persisted/deduplicated yet because this scaffold intentionally avoids adding a database.
