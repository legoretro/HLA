# Asset Guide

All replaceable images are under:

`hla-quest-project/public/assets/`

## Folders

- `backgrounds/` — room shells only; avoid baking furniture or text into them
- `props/` — microscopes, benches, PCR machine, cells, DNA, reports, kidney cooler
- `characters/` — individual PNG previews and 20-frame sprite sheets
- `icons/` — bottom quest nodes and glowing info icon
- `ui/` — blank dialogue frame and other reusable interface pieces
- `logo/` — HLA Quest logo
- `uploads/` — your class images, screenshots, diagrams, and other direct content

## Replacement rule

Keep the same filename and transparent canvas size when possible. The game will automatically use the replacement.

## Uploaded images

Put class images in:

`public/assets/uploads/`

Then reference them in `src/content/chapters.json` or Author Mode like this:

`/assets/uploads/chromosome-6-reference.png`

Scene-level media example:

```json
{
  "type": "image",
  "src": "/assets/uploads/chromosome-6-reference.png",
  "title": "Chromosome 6 reference",
  "x": 640,
  "y": 300,
  "width": 520,
  "height": 292
}
```

YouTube video slot example:

```json
{
  "type": "youtube",
  "src": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "PCR video",
  "x": 845,
  "y": 315,
  "width": 460,
  "height": 258
}
```

No Supabase is required. Uploaded files are served from GitHub Pages after the site is rebuilt and the `gh-pages` branch is updated.

## Sprite-sheet layout

Each scientist sheet is 4 columns × 5 rows with 128×192 frames:

- row 1: idle
- row 2: walk
- row 3: talk
- row 4: point
- row 5: celebrate

Frame order is left to right.

## Missing asset rule for Codex

If an asset is missing, show a labeled placeholder containing the expected filename. Never fail silently.
