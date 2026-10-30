# CLAUDE.md

Personal website ("p o i n t l e s s"), served at `pointless.xmp.systems` (see `CNAME`) via GitHub Pages straight from `main`.

## Philosophy

Keep it **as simple and dependency-free as possible**. That is a deliberate choice, not an accident:

- Plain hand-written HTML pages. No framework, no bundler, no templating, no `package.json`, no `node_modules`.
- The only build step is the Tailwind CLI turning `css/input.css` into `css/output.css`.
- **Duplication is accepted.** The nav bar, footer, `<head>` and card markup are copy-pasted into every page. Don't add includes, web components, JS-rendered partials or a static site generator to "fix" this unless asked.
- Hardly anything is optimized: big inline SVG icons are repeated, gallery photos are raw `.jpg`. That's fine.

When making changes, follow the existing copy-paste pattern: copy a neighbouring block and edit it.

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

Tailwind v3 (config in `tailwind.config.js`, `@tailwind` directives in `input.css`). The `tailwindcss` CLI isn't vendored; it is expected on `PATH` (e.g. the standalone binary).

```bash
./build.sh   # tailwindcss -i ./css/input.css -o ./css/output.css --minify
./watch.sh   # same, --watch
```

**After adding any Tailwind class that isn't used anywhere else yet, rebuild and commit `css/output.css`.** Otherwise the class has no effect in production. Custom colours (`bg-fastapi`, `bg-svelte-light`, `bg-numpy`, `bg-javascript`, …) live in `tailwind.config.js`.

## Previewing

Links are root-absolute (`/index.html`, `/music.html`), so open the site through a local server at the repo root, not `file://`:

```bash
python3 -m http.server 8000
```

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
