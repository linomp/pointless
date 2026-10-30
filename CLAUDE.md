# CLAUDE.md

Personal website ("p o i n t l e s s"), served at `pointless.xmp.systems` (see `CNAME`) via GitHub Pages from `main`.

**Two versions live side by side right now:**
- the **raw site** (repo root, plain HTML) at `/`: everything below describes it unless a section says otherwise;
- an **Astro port** (`astro/`) at `/v2`, being tested before it replaces the raw site. See "Astro port (`astro/`, served at `/v2`)" at the end and `port-plan.md`.

`.github/workflows/pages.yml` deploys both (`assemble.sh` puts them together). While both exist, content changes have to be made in both places.

## Hard rules

1. **Don't modernise the look and feel.** The owner likes the style exactly as it is. No trendy web design: no gradients, glassmorphism, rounded cards, drop shadows, hero sections, dark/light toggles, icon libraries, new fonts, fade-in or scroll animations, parallax, or "clean minimal SaaS" redesigns. Don't propose a redesign unprompted. New content copies existing blocks as they are.
2. **Stick to the colour palette** (see "Colour palette (strict)" below).
3. **Keep it snappy.** Pages are static HTML and one small CSS file, and should stay that way: no JS frameworks, analytics, trackers, extra web fonts or third-party scripts. Images go in as compressed WebP. Any JS stays tiny and inline. Add no transitions or loading spinners that slow down how fast the site feels.
4. **No new dependencies** (see below). The Astro port's dependencies are fixed too (`astro`, `@astrojs/markdown-satteri`, `tailwindcss`); don't add integrations or packages without asking.

## Philosophy

Keep it **as simple and dependency-free as possible**. That is a deliberate choice, not an accident:

- Plain hand-written HTML pages. No framework, no bundler, no templating, no `package.json`, no `node_modules`.
- The only build step is the Tailwind CLI turning `css/input.css` into `css/output.css`.
- **Duplication is accepted.** The nav bar, footer, `<head>` and card markup are copy-pasted into every page. Don't add includes, web components, JS-rendered partials or a static site generator to "fix" this unless asked.
- Hardly anything is optimized: big inline SVG icons are repeated, gallery photos are raw `.jpg`. That's fine.

When making changes, follow the existing copy-paste pattern: copy a neighbouring block and edit it.

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
| Tech pills only | `bg-fastapi(-light)`, `bg-svelte(-light)`, `bg-numpy`, `bg-javascript` | in `tailwind.config.js` |

Tech-pill colours represent each technology's brand and are never used for anything else. Add a new one to `tailwind.config.js` only when adding a pill for a new technology.

The palette is **locked in `tailwind.config.js`**: `theme.colors` is replaced (not extended) with exactly these colours, so any other colour class (e.g. `text-red-500`) generates no CSS at all. If a colour class "doesn't work", that is why. Don't add a colour there to make it work; ask first.

## Layout

```
index.html      home: bio + 3 featured cards (dev project, album, own music)
code.html       dev projects: grid of cards with tech "pills"
music.html      own music projects (YouTube embeds) + /recommended (Bandcamp embeds)
gallery.html    photo list
contact.html    contact info
css/input.css   Tailwind source: directives + 2 custom component classes
css/output.css  generated, minified, COMMITTED (it's what's actually served)
tailwind.config.js  content: ./*.html, plus custom colours for the tech pills
build.sh / watch.sh one-liners calling the tailwindcss CLI
media/img/      gallery jpgs, favicon
media/img/webp/ compressed images used for cards and embed placeholders
```

`.gitignore` excludes local image working folders (`media/img/{original,compressed,resized,discarded}`); only final assets are committed.

## Building CSS

Tailwind **v3.4.19**, standalone binary on `PATH` (installed from the GitHub release, SHA-256 checked). Config in `tailwind.config.js`, `@tailwind` directives in `input.css`. **Staying on v3 on purpose:** v4 changes default styles (border colour, hover, spacing selectors) and the browser baseline, and every page would need checking by eye. Don't upgrade or suggest it unless asked.

```bash
./build.sh   # tailwindcss -i ./css/input.css -o ./css/output.css --minify
./watch.sh   # same, --watch
```

**After adding any Tailwind class that isn't used anywhere else yet, rebuild and commit `css/output.css`.** Otherwise the class has no effect in production. Custom colours (`bg-fastapi`, `bg-svelte-light`, `bg-numpy`, `bg-javascript`, …) live in `tailwind.config.js`.

## Images

Done by hand, outside the repo: convert to WebP, then compress with an online tool. Only the result goes into `media/img/webp/`; the working folders (`original`, `resized`, `compressed`, `discarded`) are gitignored. Nothing in the repo automates this, so don't add an image pipeline. Gallery photos (`media/img/*.jpg`, used by `gallery.html` with `loading="lazy"`) are still JPEG. `grind.jpg`, `lucta.jpg`, `usfq_old.jpg` and `dxc.png` aren't referenced anywhere.

## Previewing

Links are root-absolute (`/index.html`, `/music.html`), so open the site through a local server at the repo root, not `file://`:

```bash
busybox httpd -f -p 8000   # owner's choice; python3 -m http.server 8000 also works
```

To preview exactly what gets deployed (raw site at `/` and Astro at `/v2`), build Astro first (`npm run build` in `astro/`), then:

```bash
./assemble.sh _site && busybox httpd -f -p 8000 -h _site
```

`assemble.sh` deletes and recreates `_site`, so restart the server after re-running it.

## Recurring patterns

### Page skeleton
Every page repeats: `<head>` (favicon, Google Fonts Roboto Mono, `./css/output.css`) → `<nav>` (HOME / CODE / MUSIC / GALLERY + GitHub & LinkedIn SVGs) → content → sticky `<footer>` (Home / Source / Contact, © year). The body has a tiled background image (`usfq_old.webp`) set via inline `style`. A nav or footer change has to be made in all five HTML files.

### CSS-only "Details" accordion (`music.html`)
Hidden checkbox + `<label>` + sibling `.content` div, using Tailwind's `peer`:

```html
<li class="... item">
  <input type="checkbox" id="detail-foo" class="peer appearance-none" />
  <label for="detail-foo" class="py-4 cursor-pointer grow"><p>&#8964; Details</p></label>
  <div class="content">...</div>
</li>
```

`.item` and `.content` are defined in `css/input.css` (`peer-checked:max-h-max` vs `max-h-0`). Checkbox `id`s must be unique per page. No JS.

### Embed skeleton/placeholder swap (`index.html`, `music.html`)
YouTube and Bandcamp iframes take a while to load and render, which left an annoying empty box. So every embed is a **pair**:

```html
<img id="foo_placeholder" src="./media/img/webp/foo.webp" class="w-full aspect-video">
<iframe id="foo" onload="setupPlaceholderReplacement(event)"
        class="w-full aspect-video h-0" loading="lazy" src="..."></iframe>
```

The small inline script in each page's `<head>` (duplicated in `index.html` and `music.html`):

1. On the iframe's `load` event, waits **1500 ms**. `load` fires before the player's own JS has finished drawing, so the delay hides that flash.
2. Replaces the placeholder's whole `className` with `"hidden"`.
3. Removes `h-0` from the iframe's class string, so it takes the aspect-ratio box the image was holding.

Contract for adding an embed:
- iframe `id` = `X`, placeholder `id` = `X_placeholder` (exact suffix).
- Both share the same aspect class (`aspect-video` for YouTube, `aspect-square` for Bandcamp), so swapping them doesn't shift the layout.
- iframe starts with `h-0` and has `onload="setupPlaceholderReplacement(event)"`.
- Placeholder image is a `.webp` in `media/img/webp/` (a screenshot or cover of the embed).
- Any page that uses it needs the script copied into its `<head>`.

Known limitations (accepted, keep them in mind when debugging):
- No fallback: if JS is off or the iframe never fires `load`, the iframe stays at `h-0` and only the placeholder shows (not clickable).
- `className.replace("h-0", "")` is a plain substring replace, so don't put classes containing `h-0` (e.g. `min-h-0`, `max-h-0`) on these iframes.
- Some browsers (Chromium) load tiny or zero-height iframes eagerly, so `loading="lazy"` may be ignored while `h-0` is set. That costs bandwidth, not correctness.
- 1500 ms is a fixed guess, not a "player ready" signal (cross-origin iframes don't expose one without the provider's JS API, which would be a dependency).

### Cards
- `index.html`: featured cards with a blue category link → big title → date → blurb → yellow CTA.
- `code.html`: project cards with title/year, image, `text-gray-400` paragraphs, rounded tech pills (`bg-<tech>` colours from the config), and "Try demo" / "Check repo" links.
- `gallery.html`: `<article>` with `loading="lazy"` image + title + place/year caption.

Link style used everywhere for inline links: `text-yellow-200 hover:text-purple-400 hover:underline`, external links get `target="_blank"`.

## Known nits (low priority, fix only if touching nearby)
- `music.html:236` has `class="flex-flex-col"` (typo, should be `flex flex-col`).
- `font-roboto` on `<body>` isn't a defined utility; the font actually comes from the `html` rule in `input.css`.
- Body background uses `url('../media/...')` from root pages; it works because `..` at the root resolves to the root.

## Astro port (`astro/`, served at `/v2`)

Same site, same markup, same look, built with Astro so images get optimized at build time and each embed is written once. All the rules above (look and feel, palette, snappy) apply unchanged. Full background, decisions and gotchas: `port-plan.md`.

### Commands (in `astro/`)

```bash
nvm use        # Node 26 from .nvmrc
npm ci         # install exact versions from package-lock.json
npm run dev    # dev server at http://localhost:4321/v2/
npm run build  # static output in astro/dist
```

### Adding things
- **Video or album on the music page:** drop the cover image (any size, JPG/PNG/WebP) into `src/content/music/` and add `<id>.md` next to it. `section` is `projects` or `recommended`, `order` sets the position, `kind` is `youtube` or `bandcamp` (sets the aspect ratio), Bandcamp entries also get a `fallback` link. The Markdown body is the "Details" text; links in it open in a new tab automatically. Copy an existing entry, e.g. `dxc.md` or `tonne.md`.
- **Gallery photo:** drop the photo into `src/content/gallery/` and add `<name>.md` with `order`, `title`, `caption`, `photo: ./<file>`.
- **Code card:** copy a `<Card>` block in `src/pages/code.astro`.
- **Images anywhere else:** put them in `src/assets/`, import them and use `<Image>` from `astro:assets`. Never reference images from `public/` (they don't get optimized).

No manual WebP conversion or online compression any more: the build does it (sharp, default quality 80, resized to the `width` given).

### Rules specific to the Astro version
- **Internal links** always go through `url()` from `src/lib/url.ts` (`url('music.html')`), never a hard-coded `/music.html`, because of the `/v2` base path.
- **The swap script stays `<script is:inline>`** in `Layout.astro`. A normal `<script>` gets bundled as a module and breaks the iframes' `onload`.
- **No client-side JS** otherwise: no islands, view transitions or prefetch.
- **Full Tailwind class names only.** Map variants to complete strings (`{ youtube: 'aspect-video' }`), never build them (`aspect-${kind}`).
- **Don't turn `compressHTML` back on.** It removes spaces between text and links ("Manta -Ecuador").
- **Tailwind config** is `astro/tailwind.config.cjs`, a copy of the root one with the same palette lock. Change both while both versions exist.
- **Parity:** after markup or CSS changes, compare old and `/v2` pages side by side (see "Previewing").
