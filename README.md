# Niel Ayes — Visual Storyteller Portfolio

A minimalist, high-production creative portfolio built specifically for:
1. **Photo Manipulation** (Concept composites & matte painting)
2. **Photography** (35mm/50mm stills & portrait exposures)
3. **Video Outputs** (DaVinci Resolve graded cuts powered by YouTube Unlisted 4K streaming)

Live: https://niel-portfolio-2026.vercel.app

---

## Folder Structure & How to Add Media

```text
Niel PortfolioUpgrade/
├── index.html                  # Main website markup (video cards, galleries config, hero)
├── tailwind.config.js          # Tailwind theme (colors, fonts) — rebuild CSS after editing
├── css/
│   ├── tailwind-input.css      # Tailwind source entry (@tailwind directives)
│   ├── tailwind.css            # Compiled utility CSS (DO NOT hand-edit — rebuild instead)
│   └── styles.css              # Custom styling, 3D depth hero, bento cards & celluloid grain
├── js/
│   └── main.js                 # Lightbox, YouTube modal, 3D mouse parallax
└── assets/
    ├── images/
    │   ├── portrait.webp        # Hero cutout (WebP, transparent, ~1000px wide)
    │   ├── favicon-48.png       # Browser tab icon
    │   ├── apple-touch-icon.png # iOS home-screen icon
    │   └── og-cover.jpg         # 1200x630 social share card (FB/Messenger/X previews)
    ├── manipulation/            # Composite artwork (WebP, max ~2400px, in gallery list below)
    ├── photography/             # Stills (WebP, in gallery list below)
    └── videos/                  # Video thumbnails (WebP)
```

**To add a photo:** put the file in `assets/manipulation/` or `assets/photography/`, then add its path
to the `GALLERIES` object at the bottom of `index.html`. Use simple filenames (no spaces/special
characters) — e.g. `mutant-grip-ultra-distance-zero-excuses.webp`.

**Rebuild Tailwind CSS** (only needed after editing classes in `index.html` / `js/main.js`, or the theme):

```bash
npx tailwindcss@3 -c tailwind.config.js -i css/tailwind-input.css -o css/tailwind.css --minify
```

---

## How to Link Your YouTube Videos

Open `index.html`, locate the video cards under the `<!-- PILLAR 03 // VIDEO OUTPUTS -->` section, and set each card's `data-video-id`:

```html
<!-- Example: If your YouTube link is https://youtu.be/dQw4w9WgXcQ -->
<div
  class="sm:col-span-2 bento-card cursor-pointer group"
  data-video-id="dQw4w9WgXcQ"
  onclick="openVideoModal(this)"
>
```

When a client clicks the play button, the video instantly opens in a full 4K cinematic modal with zero server lag!

---

## Performance Notes

- All hero/thumbnail art is WebP; full-page payload is ~4 MB (was ~17 MB before optimization).
- Gallery images are preloaded once by the wall script — keep new uploads ≤ ~1 MB each
  (resize to max ~2400px before adding).
