# Tracklib Naming Assistant

A static web tool for Tracklib Sounds suppliers to generate compliant pack filenames.

Built by a Tracklib supplier who got tired of manually re-naming files.

## What It Does

- **Drag & drop** `.wav` files — filenames are parsed for BPM, key, instrument, and category
- **Inline editing** — fix or fill in any field the parser couldn't detect
- **Live filename generation** — see the Tracklib-compliant filename update as you type
- **Duplicate detection** — flags any rows that would produce identical filenames
- **One-click copy** — copies the filename (without `.wav`) straight to your clipboard for pasting to rename

## Naming Format

```
PackName_Origin_BPM_Instrument_Category_Key_Descriptors.wav
```

- Spaces become hyphens
- Empty segments are omitted (no double underscores)
- BPM is required for Loops, optional for One-Shots
- Key is optional for Drums/Cymbals/Percussion
- At least one descriptor is recommended
