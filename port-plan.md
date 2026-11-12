# Astro port plan

Goal: rebuild the site in Astro, keeping the look, palette and snappiness exactly as they are, to get rid of two pain points:

1. Manual image conversion/compression (WebP + online compressor).
2. Editing many places to add or change an embed (placeholder `<img>` + `<iframe>` + Details accordion + matching ids).

Constraints (from `CLAUDE.md`): don't modernise the look, keep the palette locked, keep the site snappy (zero client JS beyond the placeholder swap), static build served by GitHub Pages on `pointless.xmp.systems`.

## Status

**Migration complete: Astro is the only site, at `/`.** The port was tested at `/v2` next to the old raw site; the notes below describe how it got there and are historical.

## Decisions

| Topic | Decision |
|---|---|
| Framework | Astro 7.4.4 on Node 26 (accepting Node + `node_modules`) |
| Where | Repo root. During the port it lived in `astro/`; the raw site stayed at the root, untouched, until switchover |
| Testing on prod | Astro build served at `/v2` next to the live raw site during the port (now `/`) |
| Embeds | Same placeholder→iframe swap (1500 ms) as today, generated from content |
| Embed content | One Markdown file per embed (`content/music/`). YouTube placeholders are the video's thumbnail fetched at build time; Bandcamp entries keep the album art next to the file |
| Gallery | One Markdown file (frontmatter only) per photo (`content/gallery/`), photo next to it |
| Code cards | Hand-written in `code.astro`, shared frame in `Card.astro` |
| Images | Current WebPs/JPGs as sources (no originals yet), optimized at build by `astro:assets` (sharp, default quality 80) |
| CSS | `tailwindcss@3.4.19` via PostCSS, same config and palette lock. Stay on v3 |

## Structure

```
/                          Astro site
.github/workflows/pages.yml builds the site, deploys dist/ to Pages
astro.config.mjs           base '/', build.format 'file', compressHTML off, markdown (Sätteri), cssTarget
package.json               astro, @astrojs/markdown-satteri, tailwindcss (exact versions)
.nvmrc / .npmrc            Node 26 / save-exact
postcss.config.cjs, tailwind.config.cjs
src/
  styles/input.css         Tailwind directives, accordion and loader rules
  lib/url.ts               url('music.html') -> '/music.html'
  layouts/Layout.astro     head, nav, footer, background, inline scripts
  components/
    EmbedPlayer.astro      cover + fixed-aspect iframe (youtube | bandcamp)
    MusicEmbed.astro       EmbedPlayer + Details accordion with the Markdown body
    Card.astro             frame of a code card
  content.config.ts        collections: music, gallery
  content/music/           <id>.md + <id>.webp per embed
  content/gallery/         <name>.md + photo per gallery item
  assets/                  other images (background, cards, contact)
  pages/                   index, code, music, gallery, contact (.astro)
public/                    favicon.ico, CNAME
```

## Steps

1. ✅ **Scaffold** `astro/` by hand. Exact versions, `.nvmrc`.
2. ✅ **Tailwind** via PostCSS, CSS checked rule by rule against `css/output.css`.
3. ✅ **Layout** with head/nav/footer/background/swap script and the `url()` helper.
4. ✅ **Pages** ported 1:1.
5. ✅ **Embeds**: `music` collection (9 entries) + `EmbedPlayer`/`MusicEmbed`. The 2 index embeds use `EmbedPlayer` directly.
6. ✅ **Images** through `<Image>`/`getImage()`. Total image weight 1.63 MB → 1.12 MB.
7. ✅ **Workflow** + `assemble.sh`. Actions pinned to commit SHAs.
8. ✅ **Switch Pages source** to "GitHub Actions" (owner, repo Settings → Pages), push, check `/` and `/v2` live. (Since then `/v2` was promoted to `/`; see "Switchover".)
9. ✅ **Parity check** (local, `assemble.sh` + busybox): every element's position, size, text and colours compared between old and `/v2` pages at 375, 800 and 1280 px. All pages identical except: contact crew images 1 px wider (rounding), and the fixed `flex-flex-col` typo on the music page (same size).
10. **Switchover** (later): see below.

## Gotchas

Found during the port are marked **(found)**.

### Tooling
- **Node ≥ 22.23.4** for Astro 7. nvm default is Node 26; system Node 18 and nvm Node 20 stay for the work monorepo. `.nvmrc` pins 26, CI reads it.
- **(found) Astro 7's default Markdown engine is Sätteri**, not remark/rehype. `markdown.rehypePlugins` no longer works without extra packages. Plugins go through `satteri({ hastPlugins })`, which needs `@astrojs/markdown-satteri` declared in `package.json` (it's what Astro already uses internally, same version).
- **(found) Smart punctuation is on by default** in Sätteri (`'` → `’`). Turned off so Markdown text renders exactly as typed.
- `node_modules` is ~170 MB, gitignored. `package-lock.json` committed, CI uses `npm ci`.
- `@astrojs/tailwind` is deprecated, so plain PostCSS with `tailwindcss@3.4.19`.

### Base path
- Every internal link goes through `url()`. Markdown content only has external links.
- The site was served under `/v2` during the port. Now `base` is `/` (the default), so links resolve to `/music.html` etc.
- `public/` files aren't auto-prefixed: favicon uses `url('favicon.ico')`.
- Background image comes from `getImage()` in the layout (inline styles aren't processed).
- `build.format: 'file'` keeps `/music.html`-style URLs, so links stayed the same after switchover.
- `noindex` was only there while the port lived under `/v2`; it was removed at switchover.
- Pages only uses the root `404.html` (not provided by this repo).

### GitHub Pages / deploy
- **After switching the Pages source to "GitHub Actions", the workflow is the only way the site deploys.** If it fails, the last deployment stays up.
- The workflow builds at the repo root and uploads `dist/`. `CLAUDE.md`, `port-plan.md`, `src/` etc. are no longer published.
- Custom domain lives in the Pages settings and survives the switch.
- Jekyll doesn't run on Actions deploys, so `_astro/` is served fine.

### Tailwind in Astro
- `content` globs: `./src/**/*.{astro,md,ts}`.
- No dynamically built class names (`aspect-${kind}` gets purged); `EmbedPlayer` maps to full names.
- **(found) Vite's CSS minifier targets modern browsers** (`@media (width>=640px)`, Safari 16.4+). Fixed with `vite.build.cssTarget: ['chrome87','edge88','firefox78','safari14']`.
- **(found) No autoprefixer needed**: the minifier adds the prefixes those browsers need.
- Markdown output is unstyled by preflight: `.md-body` rules in `input.css` give it the same link colours and paragraph spacing.

### The placeholder swap script
- `<script is:inline>` keeps it global so the iframes' `onload="..."` works (Astro would otherwise bundle it as a module).
- Ids come from the entry's file name (`vigastada`, `vigastada_placeholder`, `detail-vigastada`).
- Placeholders are `loading="eager"` like before.
- **Later change: overlay instead of swap.** The iframe now fills a fixed-aspect box from the start, with the cover on top that fades out after `load` + 1.5 s. While any image loads (covers, gallery, cards), randomly scattered yellow-200 squares rise and settle over its box, the rest staying transparent and showing the page background (repeated inside black cards and embed covers, which would otherwise show black) — an SVG data URI inlined by `Layout.astro` from `src/lib/loader.ts`, animated with CSS only; on `onload` it crossfades into the picture (`Img.astro`, `gridFade()` in `Layout.astro`). Measured with the layout-shift API: no shift during the swap, card boxes identical to the raw site at 375 and 1280 px. Side effect: lazy iframes now really load lazily (an `h-0` iframe used to load eagerly).
- Known limitations unchanged (no JS fallback, 1500 ms guess).
- **(found) The browser pane in the Claude app doesn't load YouTube/Bandcamp**, so the swap was verified by firing each iframe's `load` event: all 9 placeholders hide and iframes show at the right size. Check real players on the live site.

- **(found) The dev server renders pages per request**, so awaiting the YouTube thumbnail lookup in each card held back the rest of the page (cards appeared one by one). `covers.ts` caches lookups per video.

### Images
- Only images imported from `src/` are optimized, plus remote images from domains listed in `image.domains` (`img.youtube.com`).
- **YouTube placeholders are fetched at build time** (`src/lib/covers.ts`): `maxresdefault.jpg` if it exists, else `hqdefault.jpg` with its black bars cropped off (`fit: 'cover'` to 16:9). The build needs to reach `img.youtube.com`; visitors only get the self-hosted WebP.
- **Bandcamp album art can't be fetched automatically.** The embed player page has it (`data-player-data` → `album_art_id`), but Bandcamp only serves that page to browsers; getting it from a script would mean getting past their bot protection. Covers stay a file next to the entry.
- Widths: covers ≤ 800 px, gallery ≤ 1536 px, crew images 1200 px, others natural size.
- **(found) Re-encoding already-compressed WebPs at quality 85 made several bigger**; sharp's default 80 gives 1.12 MB total vs 1.63 MB today, so no custom quality.
- Originals get committed forever (git history). Scale big photos to ~2000 px before adding.
- Unused images (`grind.jpg`, `lucta.jpg`, `usfq_old.jpg`, `dxc.png`, `usfq_old_148k.webp`, …) not migrated.

### Markup parity
- Markup copied 1:1, quirks included (`<li>` outside `<ul>`, `font-roboto`, `text-s`), except: `flex-flex-col` typo fixed, code page's footer "Contact" no longer opens in a new tab (`target="blank"` typo), `alt` text added to images.
- **(found) `compressHTML` removed the space in "Manta - Ecuador"** (between text and `<a>`). Turned off; HTML is a bit bigger but whitespace matches the raw site.
- CSS is served from `/_astro/<hash>.css`.
- No view transitions, prefetch or client islands.
- Footer year is computed at build time.

### Transition period
- Content had to be edited twice (root HTML and `astro/`) while both versions were live. That ended at switchover.

## Switchover (done)
1. ✅ Set `base: '/'` in `astro.config.mjs`; removed the `noindex` meta.
2. ✅ Changed the workflow to build at the root and deploy only `dist/`.
3. ✅ Deleted the raw root files (`*.html`, `css/`, `media/`, `build.sh`, `watch.sh`, root `tailwind.config.js`) and the `assemble.sh` script.
4. ✅ Moved the Astro project from `astro/` to the repo root.
5. ✅ Moved `CNAME` into `public/` so it lands in `dist/`.
6. ✅ Checked old URLs (`/music.html`, `/code.html`, …) still work.
7. ✅ Updated `CLAUDE.md`.
