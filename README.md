# HLA Quest

A data-driven retro educational HLA presentation game built with Phaser 3 and Vite.

The game has 8 presenter-led scenes:

1. Welcome to HLA Quest
2. General HLA
3. Class I vs Class II
4. Alleles and inheritance
5. Simplified six-allele matching model
6. Samples, DNA extraction, and PCR
7. PCR-SSP and other methods popup
8. Final laboratory report

## Run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Author Mode

Open `/author.html` while the dev server is running. Edit scenes, presenters, dialogue, short text labels, scene media, props, info popups, audio paths, and scientist positions. Export `chapters.json`, then replace `src/content/chapters.json` with the exported file.

## Uploaded Images and YouTube

Put class images and diagrams in:

```text
public/assets/uploads/
```

Reference them like:

```json
"/assets/uploads/chromosome-6-reference.png"
```

Scene media and popup media can also use YouTube URLs. No Supabase is required; uploaded content lives in the repository and is served by GitHub Pages after rebuilding `gh-pages`.

## Voiceovers

Each info popup supports an optional MP3 voiceover. Put recordings in:

```text
public/assets/audio/scientist-1/
public/assets/audio/scientist-2/
public/assets/audio/scientist-3/
public/assets/audio/scientist-4/
```

Store the path in `src/content/chapters.json`, using the scene number and topic in the filename:

```json
"/assets/audio/scientist-3/scene-07-pcr-ssp.mp3"
```

Missing audio never breaks the popup; captions stay visible.

## Build

```bash
npm run build
```

The `dist` folder is suitable for GitHub Pages. The Vite base is already set to `./`.

For branch-based Pages deployment, publish the built `dist` contents to a `gh-pages` branch and set GitHub Pages to:

- Source: Deploy from a branch
- Branch: `gh-pages`
- Folder: `/ (root)`

## Visual checks

```bash
npm run build
npx playwright install chromium
npm run test:visual
```

See the documentation in `docs/` before revising the project.
