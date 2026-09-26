# Corbett The Vedant By Livora: guest website

Next.js 14 (App Router) + TypeScript + Tailwind + framer-motion + react-three-fiber. Talks to the Express API.

## Scripts
- `npm install`
- `npm run dev`: local dev on http://localhost:3000
- `npm run build` / `npm start`: production build and server

## Environment
Copy `.env.local.example` to `.env.local`.
- `NEXT_PUBLIC_API_URL`: API base including `/api` (e.g. `https://<app>.onrender.com/api`)
- `NEXT_PUBLIC_SITE_URL`: public URL of this site (canonical URLs, sitemap, OpenGraph)

## Editing content
- `src/config/site.ts`: name, phone, WhatsApp, email, address, socials (live values from `/settings/public` override these).
- `src/config/photos.ts`: every image on the site. To replace a photo, drop a file with the same name into `public/photos/<folder>/`. To add gallery photos, add one line to the `gallery` list.
- `src/config/experiences.ts`: experience copy.

## Deploy on Vercel
Import the repo, set **Root Directory** to `guest-web`, add the two env vars above, deploy.
