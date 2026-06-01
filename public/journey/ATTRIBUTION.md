# Journey milestone images

The app loads themed photos from **Unsplash** (free to use under the [Unsplash License](https://unsplash.com/license)). Credits are defined in `lib/constants/journey-images.ts`.

| Milestone | Theme | Photographer |
|-----------|--------|----------------|
| Hobbiton | Rolling green hills | Nick Fewings |
| Buckland | Forest river | Timothy Meinberg |
| Old Forest | Dense woodland | Johannes Plenio |
| Bree | Village lane | Erik Mclean |
| Weathertop | Mountain ridge | Kalen Emsley |
| Ford of Bruinen | Misty water | v2osk |
| Rivendell | Waterfall in forest | Luca Bravo |

## Optional: local files + LOTR filming locations

To use **self-hosted** images (better offline/PWA), run:

```bash
node scripts/fetch-journey-images.mjs
```

That script tries **Wikimedia Commons** (CC BY-SA) alternatives for Hobbiton (Matamata), Kaitoke (Rivendell), etc., and writes `public/journey/*.jpg`.

## Update existing Supabase `journey_nodes`

New challenges pick up URLs from code on create. For an **existing** challenge, run `database/patches/journey-node-image-urls.sql` in the SQL Editor (generated from `journey-images.ts`).
