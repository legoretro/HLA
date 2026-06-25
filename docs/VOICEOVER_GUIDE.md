# Voiceover Guide

Each clickable info icon can have an optional presenter MP3.

## Where files go

- Scientist 1: `hla-quest-project/public/assets/audio/scientist-1/`
- Scientist 2: `hla-quest-project/public/assets/audio/scientist-2/`
- Scientist 3: `hla-quest-project/public/assets/audio/scientist-3/`
- Scientist 4: `hla-quest-project/public/assets/audio/scientist-4/`

Use short lowercase filenames, such as:

`hla-cell-id.mp3`

## How the game finds audio

The audio path is stored in `src/content/chapters.json` inside the info popup:

```json
{
  "speaker": "scientist-1",
  "title": "HLA Cell ID",
  "text": "HLA molecules help immune cells distinguish self from non-self.",
  "audio": "/assets/audio/scientist-1/hla-cell-id.mp3"
}
```

The `speaker` controls the popup portrait. The `audio` path controls which MP3 plays.

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
