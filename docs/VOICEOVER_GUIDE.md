# Voiceover Guide

Each clickable info icon can have an optional presenter MP3.

## Where files go

- Scientist 1: `hla-quest-project/public/assets/audio/scientist-1/`
- Scientist 2: `hla-quest-project/public/assets/audio/scientist-2/`
- Scientist 3: `hla-quest-project/public/assets/audio/scientist-3/`
- Scientist 4: `hla-quest-project/public/assets/audio/scientist-4/`

Use scene-numbered filenames, such as:

`scene-02-general-hla.mp3`

That way Scientist 1's first topic and second topic do not get mixed up.

## How the game finds audio

The audio path is stored in `src/content/chapters.json` inside the info popup:

```json
{
  "speaker": "scientist-1",
  "title": "General HLA",
  "text": "Add the caption for Scientist 1's Scene 2 voiceover here.",
  "audio": "/assets/audio/scientist-1/scene-02-general-hla.mp3"
}
```

The `speaker` controls the popup portrait. The `audio` path controls which MP3 plays.

The filename must match exactly. For example, if GitHub shows:

`public/assets/audio/scientist-1/my-recording.mp3`

then the popup path must be:

`/assets/audio/scientist-1/my-recording.mp3`

If the site is deployed from the `gh-pages` branch, uploading to `main` is not enough by itself. Rebuild the game and update `gh-pages` so the live site receives the MP3.

## Current audio map

Use these exact paths for the current 8-scene version:

| Scene | Speaker | Topic | File path |
| --- | --- | --- | --- |
| 2 | Scientist 1 | General HLA | `/assets/audio/scientist-1/scene-02-general-hla.mp3` |
| 3 | Scientist 1 | Class I vs Class II | `/assets/audio/scientist-1/scene-03-class-i-class-ii.mp3` |
| 4 | Scientist 2 | Alleles and inheritance | `/assets/audio/scientist-2/scene-04-alleles-inheritance.mp3` |
| 5 | Scientist 2 | Six-allele model | `/assets/audio/scientist-2/scene-05-six-allele-model.mp3` |
| 6 | Scientist 3 | Samples, DNA, PCR | `/assets/audio/scientist-3/scene-06-dna-pcr.mp3` |
| 7 | Scientist 3 | PCR-SSP | `/assets/audio/scientist-3/scene-07-pcr-ssp.mp3` |
| 7 popup 2 | Scientist 3 | Other methods | `/assets/audio/scientist-3/scene-07-other-methods.mp3` |
| 8 | Scientist 4 | Final report | `/assets/audio/scientist-4/scene-08-final-report.mp3` |

Scene 1 is the welcome/team scene, so it does not need a voiceover unless you add an info icon.

## Recording rules

- Keep each recording about 10-15 seconds.
- Do not rely on audio alone; captions always stay visible.
- Missing audio is okay. The popup still opens and shows the caption.
- Audio starts only after the info icon is clicked.
- Audio stops when the presenter clicks NEXT, BACK, another info icon, or closes the popup.

## Easiest editing path

1. Put the MP3 file in the correct scientist folder.
2. Run the game.
3. Open `/author.html`.
4. Select the scene.
5. Edit the popup speaker, caption, and audio path.
6. Export `chapters.json`.
7. Replace `src/content/chapters.json` with the exported file.
