# Leashing AI site

Static Vercel-ready sales page for **Leashing AI**.

## Included
- `index.html` — long-form sales page with VSL section and free first session
- `styles.css` — custom visual design
- `script.js` — checkout link placeholder
- `public/assets/cover-main.png` — recommended main cover
- `public/assets/cover-alt.png` — alternate art
- `public/assets/vsl.mp4` — attached VSL/video asset copied into repo
- `ebook/LeashingAI-ebook.pdf` — local PDF build target
- `ebook/LeashingAI-ebook.md` — markdown source target

## Deploy to Vercel
1. Create a GitHub repo and push this folder.
2. Import the repo into Vercel.
3. Set the project root to this folder if needed.
4. Add your real checkout/payment link in `script.js`.

## Notes
- The CTA currently uses a placeholder checkout URL.
- This repo is intentionally dependency-light so it can deploy as a static site.
- If you later want a Next.js app, this structure can be migrated without losing the copy/design direction.
