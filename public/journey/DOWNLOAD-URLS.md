# Journey images — download these files

Save each link as the filename shown (right‑click → Save image as…).  
Put all files in this folder: `public/journey/`

| Save as | Download URL |
|---------|----------------|
| `hobbiton.jpg` | https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=85 |
| `buckland.jpg` | https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85 |
| `old-forest.jpg` | https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85 |
| `bree.jpg` | https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85 |
| `weathertop.jpg` | https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85 |
| `ford-of-bruinen.jpg` | https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=85 |
| `rivendell.jpg` | https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85 |

After saving, restart `npm run dev`. Map pins and milestone modals use `/journey/*.jpg`.

Optional: run `database/patches/journey-node-image-urls.sql` so Supabase `image_url` matches (local paths).
