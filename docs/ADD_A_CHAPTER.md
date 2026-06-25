# Add a Chapter

## Easiest method

1. Run the project.
2. Open `/author.html`.
3. Select the chapter most similar to the new one.
4. Click **Duplicate**.
5. Rename it.
6. Edit the dialogue and info text.
7. Drag the scientists into position.
8. Select the bottom icon.
9. Export `chapters.json`.
10. Replace `src/content/chapters.json`.

The bottom quest path is generated from the JSON. Codex should not require a new navigation button to be coded manually.

## Manual method

Duplicate one object inside `src/content/chapters.json`, give it a unique `id`, and update `number`, `title`, `shortLabel`, and content. Keep the JSON commas and brackets valid.
