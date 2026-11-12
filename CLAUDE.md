# CLAUDE.md

Personal website ("p o i n t l e s s"), served at `pointless.xmp.systems` (see `public/CNAME`) via GitHub Pages from `main` and built with Astro.

`.github/workflows/pages.yml` builds the site and deploys `dist/` to Pages. The old hand-written raw site and the `/v2` preview are gone; Astro is now the only version, at the root.

## Hard rules

1. **Don't modernise the look and feel.** The owner likes the style exactly as it is. No trendy web design: no gradients, glassmorphism, rounded cards, drop shadows, hero sections, dark/light toggles, icon libraries, new fonts, fade-in or scroll animations, parallax, or "clean minimal SaaS" redesigns. Don't propose a redesign unprompted. New content copies existing blocks as they are.
2. **Stick to the colour palette** (see "Colour palette (strict)" below).
3. **Keep it snappy.** The site is static HTML and one small generated CSS file: no JS frameworks, analytics, trackers, extra web fonts or third-party scripts. Images are optimized at build time. Any JS stays tiny and inline. Add no transitions or loading spinners that slow down how fast the site feels.
   - **Deliberate exceptions (owner's request):**
     - While any image is still loading, a faint yellow-200 grid of squares fills its box: randomly scattered squares scale up towards the viewer and settle back, while the rest stay transparent. The gaps show the page's tiled background; inside black cards and embed covers (which would otherwise show black) the same background is repeated behind the grid. When the image arrives, the grid crossfades into it (0.7 s); images that were already cached skip the fade. The grid is an SVG data URI generated at build time by `src/lib/loader.ts` and inlined once in `Layout.astro` (so it costs no extra request), and is the image's CSS background (`.loading-grid`), added by `Img.astro`; the crossfade is `gridFade()` in `Layout.astro` (a temporary absolutely positioned copy over the image, so layout never moves).
     - Embed covers fade out (0.4 s) when the player is ready.
     - All of it respects `prefers-reduced-motion`. Don't add animations anywhere else without asking.
4. **No new dependencies** (see below). Dependencies are fixed (`astro`, `@astrojs/markdown-satteri`, `tailwindcss`); don't add integrations or packages without asking.

## Philosophy

Keep it **as simple and dependency-free as possible**. That is a deliberate choice, not an accident:

- Static Astro pages, built ahead of time. No client-side framework, islands, view transitions or prefetch.
- The only build steps are Astro (HTML + image optimization) and Tailwind via PostCSS.
- No separate CSS build script, no image-conversion script, no `assemble.sh`. `npm run build` is the whole build.
- Hardly any client-side JS: just the inline embed-cover swap and image-grid crossfade.
- No JS-rendered content: everything is in the HTML at build time.

## Look and feel

Old-school, Bandcamp-style indie/DIY page. It should feel like a band's merch page or an old web 1.0 homepage, not a modern portfolio or SaaS landing page.

- Solid black boxes (`bg-black`) with thin white borders (`border`), sitting on a tiled photo background (`usfq_old.webp`). No gradients, no glassmorphism, no soft cards.
- Monospace everywhere (Roboto Mono). Labels are uppercase and bold. Section titles look like paths (`/my-projects`, `/recommended`), and the brand is letter-spaced (`p o i n t l e s s`, `{ }`).
- A small, loud palette (see below). Colour beyond it only comes from the tech pills.
- Square corners. The only rounded elements are the tech pills on `code.html`.
- Embedded Bandcamp/YouTube players are part of the look, framed like album covers.
- Hardly any animation (just the accordion's `transition-all`).

New UI should reuse these classes rather than introduce new colours, fonts, shadows, rounding or effects.

### Colour palette (strict)

The owner cares a lot about this. **Use only these colours, in these roles.** Don't add shades, swap one shade for a near neighbour (e.g. `yellow-300`), or use arbitrary values (`text-[#...]`) without asking first.

| Role | Class | Hex (Tailwind v3) |
|---|---|---|
| Box / nav / footer background | `bg-black` | `#000000` |
| Body text | `text-white` | `#ffffff` |
| Thin box borders | `border` (default colour) | `#e5e7eb` |
| Headings, section titles, links, CTAs | `text-yellow-200` | `#fef08a` |
| Link hover (always with `hover:underline`) | `hover:text-purple-400` | `#c084fc` |
| Hover on big yellow titles / CTAs | `hover:text-yellow-50` | `#fefce8` |
| Category labels on cards | `text-blue-200` | `#bfdbfe` |
| Secondary body text (`code.html`) | `text-gray-400` | `#9ca3af` |
| Open accordion border | `border-blue-300` (in `.content`) | `#93c5fd` |
| Tech pills only | `bg-fastapi(-light)`, `bg-svelte(-light)`, `bg-numpy`, `bg-javascript` | in `tailwind.config.cjs` |

Tech-pill colours represent each technology's brand and are never used for anything else. Add a new one to `tailwind.config.cjs` only when adding a pill for a new technology.

The palette is **locked in `tailwind.config.cjs`**: `theme.colors` is replaced (not extended) with exactly these colours, so any other colour class (e.g. `text-red-500`) generates no CSS at all. If a colour class "doesn't work", that is why. Don't add a colour there to make it work; ask first.

## Layout

```
astro.config.mjs        site URL, file-style URLs, image domains, Satééééri markdown, cssTarget
package.json            astro, @astrojs/markdown-satteri, tailwindcss (exact versions)
package-lock.json
.nvmrc / .npmrc         Node 26 / save-exact
postcss.config.cjs, tailwind.config.cjs, tsconfig.json
src/
  assets/               images imported by pages (background, project cards, contact)
  components/           Card.astro, Img.astro, EmbedPlayer.astro, MusicEmbed.astro
  content/              music/<id>.md + cover, gallery/<name>.md + photo
  content.config.ts     collections
  layouts/Layout.astro  head, nav, footer, body background, inline scripts
  lib/                  covers.ts, loader.ts, url.ts
  pages/                index, code, music, gallery, contact (.astro)
  styles/input.css      Tailwind source
public/                 favicon.ico, CNAME (copied as-is)
dist/                   build output (gitignored)
```

`.gitignore` excludes `node_modules`, `dist`, `.astro` and `_site`.

## Commands

```bash
nvm use        # Node 26 from .nvmrc
npm ci         # install exact versions from package-lock.json
npm run dev    # dev server at http://localhost:4321/
npm run build  # static output in dist/
```

Tailwind **v3.4.19** via PostCSS. **Staying on v3 on purpose:** v4 changes default styles (border colour, hover, spacing selectors) and the browser baseline, and every page would need checking by eye. Don't upgrade or suggest it unless asked.

## Previewing

Build, then serve `dist/` through a local server (not `file://`):

```bash
npm run build
busybox httpd -f -p 8000 -h dist   # owner's choice; python3 -m http.server 8000 also works
```

The build recreates `dist/`, so restart the server after rebuilding. `npm run preview` also works for a quick look.

## Adding things
- **Video or album on the music page:** add `<id>.md` to `src/content/music/`. `section` is `projects` or `recommended`, `order` sets the position, `kind` is `youtube` or `bandcamp` (sets the aspect ratio). The Markdown body is the "Details" text; links in it open in a new tab automatically. Copy an existing entry, e.g. `dxc.md` or `tonne.md`.
  - **YouTube:** nothing else needed. The cover is the video's own YouTube thumbnail, fetched at build time (`src/lib/covers.ts`, largest available, cropped to 16:9). Add `cover: ./<file>` only to use a different image.
  - **Bandcamp:** also save the album art (any size) next to the file and set `cover: ./<file>`, plus a `fallback` link. Bandcamp has no public image URL for its players, and scraping it would mean getting past their bot protection, so this stays manual.
- **Gallery photo:** drop the photo into `src/content/gallery/` and add `<name>.md` with `order`, `title`, `caption`, `photo: ./<file>`.
- **Code card:** copy a `<Card>` block in `src/pages/code.astro`.
- **Images anywhere else:** put them in `src/assets/`, import them and use `<Img>` (`src/components/Img.astro`: Astro's `<Image>` plus the loading grid). Never reference images from `public/` (they don't get optimized).

No manual WebP conversion or online compression: the build does it (sharp, default quality 80, resized to the `width` given). Don't add an image-conversion script or pipeline to the repo. Originals get committed forever, so scale big photos to ~2000 px before adding.

## Rules specific to this site
- **Internal links** always go through `url()` from `src/lib/url.ts` (`url('music.html')`), never a hard-coded `/music.html`.
- **The swap script stays `<script is:inline>`** in `Layout.astro`. A normal `<script>` gets bundled as a module and breaks the iframes' `onload`.
- **Embeds never change size.** `EmbedPlayer.astro` renders one fixed-aspect box: the iframe fills it from the start, and the cover (`#<id>_placeholder`) sits on top and fades out after `load` + 1.5 s. So swapping causes no layout shift, and `loading="lazy"` on the iframes works properly. Keep it that way.
- **No client-side JS** otherwise: no islands, view transitions or prefetch.
- **Full Tailwind class names only.** Map variants to complete strings (`{ youtube: 'aspect-video' }`), never build them (`aspect-${kind}`).
- **Don't turn `compressHTML` back on.** It removes spaces between text and links ("Manta -Ecuador").
- **Tailwind config** is `tailwind.config.cjs` (content `./src/**/*.{astro,md,ts}`), with the same palette lock.
- **`build.format: 'file'`** keeps `/music.html`-style URLs.
- After markup or CSS changes, check the pages at 375, 800 and 1280 px.

## Recurring patterns

### Page shell
`Layout.astro` holds the `<head>` (favicon, Google Fonts Roboto Mono, CSS), the nav (HOME / CODE / MUSIC / GALLERY + GitHub & LinkedIn SVGs), the sticky footer (Home / Source / Contact, © year) and the tiled body background (optimized with `getImage()` because inline styles aren't processed). Pages only provide their content.

### CSS-only "Details" accordion (`MusicEmbed.astro`)
Hidden checkbox + `<label>` + sibling `.content` div, using Tailwind's `peer`:

```html
<li class="... item">
  <input type="checkbox" id="detail-foo" class="peer appearance-none" />
  <label for="detail-foo" class="py-4 cursor-pointer grow"><p>&#8964; Details</p></label>
  <div class="content">...</div>
</li>
```

`.item` and `.content` are defined in `src/styles/input.css` (`peer-checked:max-h-max` vs `max-h-0`). Checkbox `id`s must be unique per page. No JS.

### Embeds
The cover sits over a fixed-aspect iframe box from the start. The inline script in `Layout.astro` waits **1500 ms** after the iframe's `load` (the player's own JS is still drawing before that), then fades the cover out. Ids come from the content file name (`<id>`, `<id>_placeholder`, `detail-<id>`). `kind` picks `aspect-video` (YouTube) or `aspect-square` (Bandcamp) via full class names.

Known limitations (accepted, keep them in mind when debugging):
- No fallback: if JS is off or the iframe never fires `load`, the cover stays (not clickable).
- 1500 ms is a fixed guess, not a "player ready" signal (cross-origin iframes don't expose one without the provider's JS API, which would be a dependency).
- On the dev server, YouTube thumbnail lookups are cached in `covers.ts` so cards don't appear one by one.

### Cards
- `index.astro`: featured cards with a blue category link → big title → date → blurb → yellow CTA.
- `code.astro`: project cards via `Card.astro`, with title/year, image, `text-gray-400` paragraphs, rounded tech pills (`bg-<tech>` colours from the config), and "Try demo" / "Check repo" links.
- `gallery.astro`: `<article>` with `loading="lazy"` image + title + place/year caption.

Link style used everywhere for inline links: `text-yellow-200 hover:text-purple-400 hover:underline`, external links get `target="_blank"`.

## Images
- Only images imported from `src/` are optimized, plus remote images from domains listed in `image.domains` (`img.youtube.com`).
- **YouTube covers are fetched at build time** (`src/lib/covers.ts`): `maxresdefault.jpg` if it exists, else `hqdefault.jpg` with its black bars cropped off (`fit: 'cover'` to 16:9). The build needs to reach `img.youtube.com`; visitors only get the self-hosted WebP.
- **Bandcamp album art can't be fetched automatically.** The embed player page has it (`data-player-data` → `album_art_id`), but Bandcamp only serves that page to browsers; getting it from a script would mean getting past their bot protection. Covers stay a file next to the entry.
- Widths: covers ≤ 800 px, gallery ≤ 1536 px, crew images 1200 px, others natural size.

## Deployment
- `main` → GitHub Pages via Actions. Repo Settings → Pages → Source must be "GitHub Actions".
- CI reads `.nvmrc`, runs `npm ci` and `npm run build`, and uploads `dist/`.
- `public/CNAME` puts the custom domain in the deployed root.
- Jekyll doesn't run on Actions deploys, so `_astro/` is served fine.

## Known nits (low priority, fix only if touching nearby)
- `font-roboto` on `<body>` isn't a defined utility; the font actually comes from the `html` rule in `input.css`.

## History
`port-plan.md` records the Astro port: decisions, gotchas and the parity check against the old raw site. It is historical; don't treat its `/v2` or raw-site instructions as current.
