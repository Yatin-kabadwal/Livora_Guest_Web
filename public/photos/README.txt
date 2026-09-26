PHOTOS FOLDER  --  START HERE
================================================================
Every image in this folder is a DUMMY placeholder (you can tell by the
"DUMMY" label in the corner). To use your real photos:

1. Open the folder below that matches (hero, resort, rooms, dining,
   experiences, gallery).
2. Delete the dummy file, then drop your real photo in with the
   EXACT SAME FILE NAME  (example: rooms/deluxe-1.jpg).
   Keep the .jpg extension (convert PNG/HEIC to JPG first).
3. Redeploy the guest website to Vercel (git push, or `vercel --prod`).

You can also add MORE gallery photos: put them in gallery/ and add a line
to  src/config/photos.ts  (the file is heavily commented).

Recommended sizes (larger is fine, keep each file under ~400 KB for speed;
use squoosh.app or tinypng.com to compress):
  hero/         2000 x 1200   landscape
  resort/       1600 x 1000   landscape
  rooms/        1600 x 1067   landscape (3 photos per room type)
  dining/       1400 x 1000   landscape
  experiences/  1200 x 1400   portrait
  gallery/      1400 x 1000   landscape
  og-cover.jpg  1200 x 630    (the picture people see when the link is shared on WhatsApp)

Room photos uploaded from the Admin panel (Rooms -> edit -> photos) are stored
on Cloudinary and override these dummy files for that room.
