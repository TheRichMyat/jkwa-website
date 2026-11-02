# Image map (chosen by Claude, approved by owner)

| File | Section | Phase | `object-position` | Notes |
|---|---|---|---|---|
| `About image.jpg` | About (centre image) | 2 | `50% 60%` | Bright minimal interior, wood stair + window. Portrait 818×1227 cropped to the landscape slot. |
| `PROJECT/01 CEYLON ROAD/04.jpg` | Services (right, full-bleed) | FIX-01 | `50% 45%` | Replaced the blurry 1024px `Services image.jpg`. Bespoke timber shelving + lattice screen joinery, portrait 1792×2400 (already optimised, don't re-compress). Same photo as Ceylon Road gallery image 04. |
| `Contact image.jpg` | Contact (left panel) | 3 | `50% 65%` | Japanese garden pond + stone lantern, 1108×1477. Keep the pond and lantern in frame. |
| ~~`1.jpg`–`6.jpg`~~ | ~~Placeholder project images~~ | 3–4 | — | **Removed in FIX-01** (all placeholder projects deleted; the files in `web/public` are gone). |
| `PROJECT/01 CEYLON ROAD/01–07` | Ceylon Road project | FIX-01 | `center` | `web/public/images/projects/ceylon-road/ceylon-road-01…07.jpg`. 01–02 landscape 1600×898, 03–07 portrait 1792×2400. Cover = 01; gallery = 02, 07, 03, 04, 05, 06. `PROJECT/` itself is git-ignored (53MB of originals). |

## Resolution warning
These files are small (450–1100px wide), probably compressed by a messaging or social app. **Don't upscale them.** Copy them as they are (strip metadata only), with the right `sizes` on `next/image`. They'll look slightly soft on high-density screens until the client sends the originals.
