# Astro port plan

Goal: rebuild the site in Astro, keeping the look, palette and snappiness exactly as they are, to get rid of two pain points:

1. Manual image conversion/compression (WebP + online compressor).
2. Editing many places to add or change an embed (placeholder `<img>` + `<iframe>` + Details accordion + matching ids).

Constraints (from `CLAUDE.md`): don't modernise the look, keep the palette locked, keep the site snappy (zero client JS beyond the placeholder swap), static build served by GitHub Pages on `pointless.xmp.systems`.

## Status

**Port done and verified locally. Waiting on step 8 (owner switches GitHub Pages to "GitHub Actions"), then live check of `/` and `/v2`.**

## Decisions

| Topic | Decision |
|---|---|
| Framework | Astro 7.4.4 on Node 26 (accepting Node + `node_modules`) |
| Where | `astro/` subfolder on `main`. The raw site stays at the repo root, untouched |
| Testing on prod | Astro build served at **`/v2`** next to the live site, same Pages deploy |
| Embeds | Same placeholder→iframe swap (1500 ms) as today, generated from content |
| Embed content | One Markdown file per embed (`content/music/`), cover image next to it |
| Gallery | One Markdown file (frontmatter only) per photo (`content/gallery/`), photo next to it |
| Code cards | Hand-written in `code.astro`, shared frame in `Card.astro` |
| Images | Current WebPs/JPGs as sources (no originals yet), optimized at build by `astro:assets` (sharp, default quality 80) |
| CSS | `tailwindcss@3.4.19` via PostCSS, same config and palette lock. Stay on v3 |

## Structure

```
/                           raw site (unchanged until switchover)
assemble.sh                 builds the deploy folder: raw site at /, astro/dist at /v2
.github/workflows/pages.yml builds astro/, runs assemble.sh, deploys to Pages
astro/
  astro.config.mjs          base '/v2', build.format 'file', compressHTML off, markdown (Sätteri), cssTarget
  package.json              astro, @astrojs/markdown-satteri, tailwindcss (exact versions)
  .nvmrc / .npmrc           Node 26 / save-exact
  postcss.config.cjs, tailwind.config.cjs
  src/
    styles/input.css        copy of css/input.css + .md-body rules for Markdown text
    lib/url.ts              url('music.html') -> '/v2/music.html'
    layouts/Layout.astro    head, nav, footer, background, swap script (is:inline), noindex on /v2
    components/
      EmbedPlayer.astro     placeholder <Image> + iframe (youtube | bandcamp)
      MusicEmbed.astro      EmbedPlayer + Details accordion with the Markdown body
      Card.astro            frame of a code card
    content.config.ts       collections: music, gallery
    content/music/          <id>.md + <id>.webp per embed
    content/gallery/        <name>.md + photo per gallery item
    assets/                 other images (background, cards, contact)
    pages/                  index, code, music, gallery, contact (.astro)
  public/favicon.ico
```

## Steps

1. ✅ **Scaffold** `astro/` by hand. Exact versions, `.nvmrc`.
2. ✅ **Tailwind** via PostCSS, CSS checked rule by rule against `css/output.css`.
3. ✅ **Layout** with head/nav/footer/background/swap script and the `url()` helper.
4. ✅ **Pages** ported 1:1.
5. ✅ **Embeds**: `music` collection (9 entries) + `EmbedPlayer`/`MusicEmbed`. The 2 index embeds use `EmbedPlayer` directly.
6. ✅ **Images** through `<Image>`/`getImage()`. Total image weight 1.63 MB → 1.12 MB.
7. ✅ **Workflow** + `assemble.sh`. Actions pinned to commit SHAs.
8. ⏳ **Switch Pages source** to "GitHub Actions" (owner, repo Settings → Pages), push, check `/` and `/v2` live.
9. ✅ **Parity check** (local, `assemble.sh` + busybox): every element's position, size, text and colours compared between old and `/v2` pages at 375, 800 and 1280 px. All pages identical except: contact crew images 1 px wider (rounding), and the fixed `flex-flex-col` typo on the music page (same size).
10. **Switchover** (later): see below.

## Gotchas

Found during the port are marked **(found)**.

### Tooling
- **Node ≥ 22.23.4** for Astro 7. nvm default is Node 26; system Node 18 and nvm Node 20 stay for the work monorepo. `astro/.nvmrc` pins 26, CI reads it.
- **(found) Astro 7's default Markdown engine is Sätteri**, not remark/rehype. `markdown.rehypePlugins` no longer works without extra packages. Plugins go through `satteri({ hastPlugins })`, which needs `@astrojs/markdown-satteri` declared in `package.json` (it's what Astro already uses internally, same version).
- **(found) Smart punctuation is on by default** in Sätteri (`'` → `’`). Turned off so Markdown text renders exactly as typed.
- `node_modules` is ~170 MB, gitignored. `package-lock.json` committed, CI uses `npm ci`.
- `@astrojs/tailwind` is deprecated, so plain PostCSS with `tailwindcss@3.4.19`.

### Base path `/v2`
- Every internal link goes through `url()`. Markdown content only has external links.
- `public/` files aren't auto-prefixed: favicon uses `url('favicon.ico')`.
- Background image comes from `getImage()` in the layout (inline styles aren't processed).
- `build.format: 'file'` keeps `/music.html`-style URLs, so links stay the same after switchover.
- `/v2` has `noindex` (automatic while `base` isn't `/`). It's not secret, just not indexed.
- Pages only uses the root `404.html`.

### GitHub Pages / deploy
- **After switching the Pages source to "GitHub Actions", the workflow is the only way the site deploys.** If it fails, the last deployment stays up. Order: push the workflow, switch the source, run the workflow (push or "Run workflow"), check `/` and `/v2`.
- `assemble.sh` copies only site files (`*.html`, `css/`, `media/`, `CNAME`). `CLAUDE.md`, `port-plan.md`, `astro/` sources etc. are no longer published.
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
- Known limitations unchanged (no JS fallback, 1500 ms guess).
- **(found) The browser pane in the Claude app doesn't load YouTube/Bandcamp**, so the swap was verified by firing each iframe's `load` event: all 9 placeholders hide and iframes show at the right size. Check real players on `/v2` once live.

### Images
- Only images imported from `src/` are optimized.
- Widths: covers ≤ 800 px, gallery ≤ 1536 px, crew images 1200 px, others natural size.
- **(found) Re-encoding already-compressed WebPs at quality 85 made several bigger**; sharp's default 80 gives 1.12 MB total vs 1.63 MB today, so no custom quality.
- Originals get committed forever (git history). Scale big photos to ~2000 px before adding.
- Unused images (`grind.jpg`, `lucta.jpg`, `usfq_old.jpg`, `dxc.png`, `usfq_old_148k.webp`, …) not migrated.

### Markup parity
- Markup copied 1:1, quirks included (`<li>` outside `<ul>`, `font-roboto`, `text-s`), except: `flex-flex-col` typo fixed, code page's footer "Contact" no longer opens in a new tab (`target="blank"` typo), `alt` text added to images.
- **(found) `compressHTML` removed the space in "Manta - Ecuador"** (between text and `<a>`). Turned off; HTML is a bit bigger but whitespace matches the raw site.
- CSS is served from `/v2/_astro/<hash>.css`.
- No view transitions, prefetch or client islands.
- Footer year is computed at build time.

### Transition period
- **Content gets edited twice** (root HTML and `astro/`) while both versions are live. Freeze content changes, or do them in both places.

## Switchover (later)
1. Set `base: '/'` in `astro.config.mjs` (noindex disappears automatically).
2. Change `assemble.sh` / the workflow to deploy only `astro/dist` (+ `CNAME`).
3. Delete the raw root files (`*.html`, `css/`, `media/`, `build.sh`, `watch.sh`, root `tailwind.config.js`), optionally move `astro/*` to the repo root.
4. Check old URLs (`/music.html`, `/code.html`, …) still work.
5. Update `CLAUDE.md`.
