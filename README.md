# HLA Quest

A data-driven retro educational HLA presentation game built with Phaser 3 and Vite.

The game has 8 presenter-led scenes:

1. What is HLA?
2. Class I vs Class II
3. Alleles and inheritance
4. Simplified six-allele matching model
5. Samples, DNA extraction, and PCR
6. PCR-SSP and other methods popup
7. Compare results and rejection risk
8. Final laboratory report

## Run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Author Mode

Open `/author.html` while the dev server is running. Edit scenes, presenters, dialogue, cards, props, info popups, audio paths, and scientist positions. Export `chapters.json`, then replace `src/content/chapters.json` with the exported file.

## Voiceovers

Each info popup supports an optional MP3 voiceover. Put recordings in:

```text
public/assets/audio/scientist-1/
public/assets/audio/scientist-2/
public/assets/audio/scientist-3/
public/assets/audio/scientist-4/
```

Store the path in `src/content/chapters.json`, for example:

```json
"/assets/audio/scientist-3/pcr-ssp.mp3"
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
