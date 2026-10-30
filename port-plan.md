# Astro port plan

Goal: rebuild the site in Astro, keeping the look, palette and snappiness exactly as they are, to get rid of two pain points:

1. Manual image conversion/compression (WebP + online compressor).
2. Editing many places to add or change an embed (placeholder `<img>` + `<iframe>` + Details accordion + matching ids).

Constraints (from `CLAUDE.md`): don't modernise the look, keep the palette locked, keep the site snappy (zero client JS beyond the placeholder swap), static build served by GitHub Pages on `pointless.xmp.systems`.

## Decisions so far

| Topic | Decision |
|---|---|
| Framework | Astro (accepting Node + `node_modules`) |
| Where | `astro/` subfolder on `main`. The raw site stays at the repo root, untouched |
| Testing on prod | Astro build served at **`/v2`** next to the live site, same Pages deploy |
| Embeds | Same placeholder→iframe swap (1500 ms) as today, generated from content |
| Embed content | One Markdown file per embed (content collection): frontmatter = kind/src/cover/links, body = details text |
| Images | Originals in `astro/src/assets/`, optimized at build by `astro:assets` (sharp) |
| CSS | `tailwindcss@3.4.19` via PostCSS, same config and palette lock |
| Tailwind version | Stay on v3 |

## Target structure

```
/                         raw site (unchanged until switchover)
astro/
  astro.config.mjs        site, base: '/v2', build.format: 'file'
  package.json            astro, tailwindcss@3.4.19, autoprefixer (exact versions)
  postcss.config.cjs
  tailwind.config.cjs     copy of the root one, content → ./src/**/*
  src/
    styles/input.css      copy of css/input.css (+ markdown link styles)
    layouts/Layout.astro  head, nav, footer, background, swap script
    components/
      Embed.astro         placeholder + iframe + Details, from one entry
      Card.astro          index / code cards
    content.config.ts     collections: music, (maybe) projects, gallery
    content/music/*.md    one file per embed
    assets/               covers, gallery photos, background (originals)
    pages/                index, code, music, gallery, contact (.astro)
  public/                 favicon only
.github/workflows/pages.yml  builds astro, assembles root + /v2, deploys
```

## Steps

1. **Scaffold** `astro/` by hand (minimal template, no example content, no integrations). Pin exact versions.
2. **Tailwind**: PostCSS config, copy `tailwind.config.js` and `input.css`. Build and diff the generated CSS against `css/output.css`.
3. **Layout**: move head/nav/footer/background/swap script into `Layout.astro`. All internal links go through a `url()` helper that prefixes `import.meta.env.BASE_URL`.
4. **Pages**: port each page 1:1, copying the markup and classes. Start with `contact` (simplest), then `gallery`, `code`, `index`, `music`.
5. **Embeds**: `music` content collection + `Embed.astro`. Migrate all 9 music embeds + 2 on index.
6. **Images**: move originals (or the current WebPs where no original exists) into `src/assets/`, swap `<img>` for `<Image>`.
7. **Workflow**: GitHub Actions builds `astro/`, copies the root site files into `_site/`, puts `astro/dist` into `_site/v2/`, deploys.
8. **Switch Pages source** to "GitHub Actions" (owner does this in repo settings), check both `/` and `/v2` live.
9. **Visual parity check**: compare each page old vs `/v2` at phone and desktop widths (I can do this in the browser pane with screenshots).
10. **Switchover** (later, separate step): see below.

## Gotchas

### Tooling
- **Node version.** Current Astro is 7.4.4 and needs **Node ≥ 22.23.4**. Done: nvm default is now Node 26.13.0 (LTS). System Node 18 (`/usr/bin/node`) and nvm Node 20 stay installed on purpose (work monorepo), so add `.nvmrc` (`26`) in `astro/` and use the same version in CI.
- **My Astro knowledge is pre-7.** Content collection and image APIs changed in Astro 5 (`content.config.ts` + `glob()` loader, `image()` schema helper). I'll verify each API against the Astro 7 docs while implementing, not from memory.
- **`node_modules` is ~100–200 MB** (sharp is big). Gitignore `astro/node_modules`, `astro/dist`, `astro/.astro`. Commit `package-lock.json` and use `npm ci` in CI.
- **sharp** ships prebuilt native binaries. Fine on Linux x64 and in CI. If install ever fails, it's usually Node version or libc.
- **Pin exact versions** (`"astro": "7.4.4"`, not `^7`) so a build in a year produces the same site.
- **`@astrojs/tailwind` integration is deprecated** (v4 moved to a Vite plugin). Use plain PostCSS with `tailwindcss@3.4.19` instead, which Astro/Vite picks up from `postcss.config.cjs` automatically.

### Base path `/v2`
- **Every internal link and asset must include the base.** `href="/music.html"` copied as-is would send `/v2` visitors back to the old site. Use a tiny helper (`url('music.html')` → `/v2/music.html`) everywhere, including inside Markdown content (or keep Markdown links external only).
- **`public/` files are not auto-prefixed** either: favicon must be `${BASE_URL}favicon.ico`.
- **Inline-style background image**: `style="background-image: url('../media/img/webp/usfq_old.webp')"` is not processed by Astro. Import the image in the layout and use `getImage()` to get its optimized URL for the inline style.
- **URL shape.** Astro defaults to `music/index.html` → `/music/`. Today's URLs are `/music.html` and may be linked from LinkedIn etc. Set `build.format: 'file'` so the output is `music.html` and URLs stay identical after switchover.
- **`/v2` is not hidden.** Anyone who guesses it can see it. Add `<meta name="robots" content="noindex">` while on `/v2` (driven by config, so it disappears at switchover).
- **404 page.** Pages uses only the root `404.html`. A `/v2` 404 page won't be used until switchover. Not a problem, just don't be surprised.

### GitHub Pages / deploy
- **Switching the Pages source to "GitHub Actions" makes the workflow the only way the root site deploys.** If the workflow is broken, pushes stop updating the live site (the last deployment stays up). Order: merge the workflow, switch the source, re-run the workflow, check `/` and `/v2`.
- **Copy only site files** into the deploy (`*.html`, `css/`, `media/`, `CNAME`), not `astro/`, `CLAUDE.md`, `build.sh`, `port-plan.md`. Today the branch deploy publishes everything in the repo; an allowlist is an improvement.
- **Custom domain** is stored in the Pages settings and survives the switch. With Actions deploys the `CNAME` file is ignored by Pages but harmless to keep.
- **Jekyll** currently runs on branch deploys and would hide folders starting with `_` (Astro's `_astro/`). With Actions deploy Jekyll doesn't run, so no `.nojekyll` needed.
- **Pin action versions** (`actions/checkout`, `setup-node`, `upload-pages-artifact`, `deploy-pages`) to exact versions or commit SHAs. Workflow needs `permissions: pages: write, id-token: write` and a `concurrency` group so two pushes don't race.
- **Root site keeps using `css/output.css`** built by the standalone binary. Two Tailwind setups exist during the transition; the Astro build must never write into the root `css/`.

### Tailwind in Astro
- **`content` globs** must point at `./src/**/*.{astro,md,ts}`. Classes that appear only in Markdown or data files must be covered too.
- **No dynamically built class names.** `` `aspect-${kind}` `` gets purged. Map to full class names: `{ youtube: 'aspect-video', bandcamp: 'aspect-square' }`.
- **Autoprefixer.** The standalone binary adds vendor prefixes (`-moz-tab-size` etc.); plain PostCSS doesn't. Add `autoprefixer` to match the current output exactly.
- **Markdown output is unstyled.** Preflight resets `<a>`, `<p>` margins etc. Add a small rule in `input.css` (e.g. `.md a { @apply text-yellow-200 hover:text-purple-400 hover:underline }`) instead of pulling in the typography plugin.

### The placeholder swap script
- **Astro bundles `<script>` tags** into deferred ES modules. `setupPlaceholderReplacement` would no longer be a global, and the inline `onload="..."` would throw `ReferenceError`. Use **`<script is:inline>`** in the layout so it stays exactly as today.
- **Ids must be unique per page.** `Embed.astro` derives `X`, `X_placeholder` and `detail-X` from the entry's file name. The same entry used on both index and music is fine (different pages).
- **Placeholder images via `<Image>`** get `width`/`height` attributes and `loading="lazy"` by default. Keep the `w-full aspect-video|square` classes so the box size doesn't change. The script's `className = "hidden"` still works.
- The known limitations stay (no JS fallback, 1500 ms guess, eager-loading of `h-0` iframes). Out of scope for the port, could be a later improvement.

### Images
- **Only images under `src/` are optimized.** Anything in `public/` is copied as-is.
- **Pick output widths** per use: covers are shown at ~300–600 px, so e.g. `width={800}` (or `widths` + `sizes` for a srcset). Otherwise Astro keeps the original dimensions and only re-encodes.
- **Originals get committed, forever.** Git history never forgets: a 5 MB phone photo stays in the repo even after deletion. Scale gallery originals down to ~2000 px before committing.
- **Missing originals.** Some current WebPs may have no original left locally. Use the WebP as the source; re-encoding an already compressed WebP loses a bit of quality, so use a high `quality` for those.
- **Unused images** (`grind.jpg`, `lucta.jpg`, `usfq_old.jpg`, `dxc.png`) are not migrated.

### Markup parity
- **Copy markup 1:1, including the quirks**, so the visual diff is zero: `<li>` outside `<ul>` in music cards, `flex-flex-col` typo, `font-roboto`. Fix them later in a separate, visible commit.
- **`compressHTML`** (on by default) collapses whitespace. It keeps one space between inline elements, so text and link spacing should match, but check spots like `Ecuador</a>, currently...`.
- **CSS file moves** to `/v2/_astro/<hash>.css`. Small stylesheets may be inlined (`build.inlineStylesheets: 'auto'`); fine either way.
- **No extra JS.** Don't enable view transitions, prefetch or client islands: they'd break the snappy/no-trendy rules.
- **Footer year** can be computed at build (`new Date().getFullYear()`), one less manual update.

### Transition period
- **Content gets edited twice** (root HTML and `astro/`) while both versions live. Freeze content changes during the port, or accept doing them twice.
- **`CLAUDE.md`** needs a section for the Astro version (structure, how to add an embed, image workflow, base helper) and later loses the raw-site sections.

## Switchover (later)
1. Set `base: '/'`, remove the noindex meta.
2. Workflow deploys only `astro/dist` (drop the copy-root step).
3. Delete the raw root files (`*.html`, `css/`, `media/`, `build.sh`, `watch.sh`, root `tailwind.config.js`), optionally move `astro/*` to the repo root.
4. Check that old URLs (`/music.html`, `/code.html`, …) still work thanks to `build.format: 'file'`.
5. Update `CLAUDE.md`.

## Answered
- **Code cards:** stay hand-written in `code.astro`, wrapped in a small `<Card>` component for the shared frame (border, black box, title, year). Images inside still use `<Image>`. Cards vary too much for a fixed data shape.
- **Gallery:** becomes a content collection (one entry per photo: image, title, caption).
- **Originals:** only the WebPs exist for now. Use them as sources (high `quality`, resized down to display size). Album cover originals may come later: replace the file in `src/assets/` and update the path in the entry's frontmatter; nothing else changes.
