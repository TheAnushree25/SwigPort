# SwigPort

Portfolio of **Shirsha Bhattacharjee**, senior visualizer, designer and
illustrator in Kolkata. The structure and motion language follow
[bleibtgleich.dev](https://bleibtgleich.dev/), re-cast in a port-wine & bone
palette ("a swig of port": deep oxblood, crimson, warm white).

Work shown comes from her Behance, [behance.net/artofshirsha](https://www.behance.net/artofshirsha),
led by [Visual Campaign — Rakhi'26](https://www.behance.net/gallery/255096093/Visual-Campaign-Rakhi26)
for the Swiggy Instamart app. Every card and index row links back to the
project on Behance.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (any free port)
npm run build      # production bundle in dist/
npm run preview    # serve dist/ locally
```

## Edit the content

Everything you read on the site lives in **`src/content.js`**: name, role,
city, headline lines, manifesto, projects (Case = whole project, Shot = one
frame), the Rakhi'26 frames, socials and the five colour modes.

Images live in `public/work/` (960×720 crops used by the cards, globe and hero
carousel) and `public/work/wide/` (full frames for the Experiments corridor).
To add a project, drop both versions in and add an entry to `projects`.

## Stack

| Piece | Used for |
| --- | --- |
| React 19 + React Router 7 | pages and routing |
| GSAP 3.15 (ScrollTrigger, SplitText, MorphSVG, CustomEase) | every animation |
| Lenis | smooth scrolling, synced to the GSAP ticker |
| three.js | fluid reveal, project globe, liquid clock blob, experiments corridor |
| Inter Tight (self-hosted) | the Akzidenz-style grotesk |

## What maps to what

| Reference effect | Here |
| --- | --- |
| Fluid canvas revealing orbiting work under the hero | `components/FluidReveal.jsx` + `OrbitTiles.jsx` (WebGL ping-pong mask with a crimson ink rim over Rakhi'26 frames) |
| Gooey text melt (preloader, page enters) | `lib/goo.js` (per-element SVG blur + alpha threshold) |
| Counter preloader | `components/Preloader.jsx` (follows real image loading) |
| Morphing totem mascot | `components/Totem.jsx` (a drop of port that blinks) |
| Staircase menu panels + Experiments tab | `components/Nav.jsx` |
| Blur-out / goo-in page transitions | `App.jsx` |
| Work years with a 3D globe of projects | `pages/Home.jsx` + `lib/webgl/sphere.js` |
| Theme modes with a liquid flood | `components/ThemeSwitches.jsx`, `ThemeFlood.jsx`, `lib/theme.js` |
| Awards table with floating certificates | `components/Archive.jsx` (Index & Archive of projects, covers float on hover) |
| Manifesto with live clock | `components/Footer.jsx`, `Clock.jsx` (Kolkata time) |
| Name halves that merge at the page end | `components/StickyName.jsx` |
| Work page window that opens and grows; Cards / Sphere | `pages/Work.jsx` |
| Rotary-phone contact dial | `components/Dial.jsx` |
| Experiments 3D field | `pages/Experiments.jsx` + `lib/webgl/field.js` |
| Grid toggle, cursor chat (press `/`) | `GridOverlay.jsx`, `CursorChat.jsx` |

Sizes follow the reference's fluid system: the layout is drawn on a 1440px
canvas (8 columns × 162px, 16px gutters) and scales with the viewport; see
`src/styles/base.css`. Tablet and phone layouts switch to 4 columns.

## Deploy

`vercel.json` rewrites every route to `index.html`, so `/work`, `/contact`
and `/experiments` load directly. Any static host works the same way with an
SPA fallback.
