# Niel Ayes — Visual Storyteller Portfolio

A minimalist, high-production creative portfolio built specifically for:
1. **Photo Manipulation** (Concept composites & matte painting)
2. **Photography** (35mm/50mm stills & portrait exposures)
3. **Video Outputs** (DaVinci Resolve graded cuts powered by YouTube Unlisted 4K streaming)

---

## Folder Structure & How to Add Media

```text
EmtyNielPorfolio/
├── index.html                  # Main website markup
├── css/
│   └── styles.css              # Custom styling, 3D depth hero, bento cards & celluloid grain
├── js/
│   └── main.js                 # Lightbox, YouTube modal, 3D mouse parallax, copy routines
└── assets/
    ├── images/
    │   └── profile-cutout.png   # Drop your transparent background PNG portrait here!
    ├── manipulation/
    │   ├── manipulation-1.jpg  # Hero composite artwork
    │   ├── manipulation-2.jpg  # Portrait composite edit
    │   └── manipulation-3.jpg  # Widescreen cinematic matte painting
    ├── photography/
    │   ├── photo-1.jpg         # Street still
    │   ├── photo-2.jpg         # Portrait & shadow
    │   ├── photo-3.jpg         # Live stage energy
    │   └── photo-4.jpg         # Architectural geometry
    └── videos/
        ├── featured-reel.jpg   # Spotlight video thumbnail
        ├── video-2.jpg         # Video 2 thumbnail
        └── video-3.jpg         # Video 3 thumbnail
```

---

## How to Link Your YouTube Videos

Open `index.html` in any text editor, locate the video cards under the `<!-- PILLAR 03 // VIDEO OUTPUTS -->` section, and replace `YOUR_YOUTUBE_VIDEO_ID_HERE` with your unlisted video ID:

```html
<!-- Example: If your YouTube link is https://youtu.be/dQw4w9WgXcQ -->
<div 
  class="lg:col-span-8 bento-card cursor-pointer group" 
  data-video-id="dQw4w9WgXcQ"
  onclick="openVideoModal(this)"
>
```

When a client clicks the play button, the video instantly opens in a full 4K cinematic modal with zero server lag!
