# Author Mode Guide

1. Open a terminal in `hla-quest-project`.
2. Run `npm install` once.
3. Run `npm run dev`.
4. Open the displayed local URL and add `/author.html`.
5. Select a chapter.
6. Change its title, short label, presenter, dialogue, or interaction.
7. Edit info popups, including caption text, presenter portrait, optional image, optional YouTube URL, and optional MP3 path.
8. Edit short text labels, scene media, props, bottom-path icon, and scientist positions.
9. Drag text labels, media, props, info icons, and scientists in the preview.
10. Duplicate a chapter when you need another step.
11. Click **Export chapters.json**.
12. Replace `src/content/chapters.json` with the exported file.
13. Refresh the game.

The Author Mode exports data; it does not directly modify source files.

See `VOICEOVER_GUIDE.md` for the MP3 folder structure and popup audio rules.
See `ASSET_GUIDE.md` for uploaded image and YouTube media paths.
