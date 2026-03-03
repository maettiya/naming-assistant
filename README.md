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

### Valid Instruments

Drums, Cymbals, Percussion, Bass, Synth, Keys, Guitar, Strings, Brass, FX, Vocals, Woodwinds

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Connect to Git**
4. Select your GitHub repository
5. Configure the build:
   - **Framework preset**: None
   - **Build command**: _(leave empty)_
   - **Build output directory**: `/`
6. Click **Save and Deploy**

That's it. No build step, no framework, no config. Cloudflare serves the static files directly.

Every push to `main` triggers a new deployment automatically.
