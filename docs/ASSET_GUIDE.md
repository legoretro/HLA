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

## Replacement rule

Keep the same filename and transparent canvas size when possible. The game will automatically use the replacement.

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
