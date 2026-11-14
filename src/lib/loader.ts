// Faint yellow grid shown behind images while they load (Img.astro, .loading-grid in input.css).
// It is inlined as a data URI, so the loader costs no extra request (which the old /spiral.svg did).
// Inside the SVG, randomly scattered squares rise towards the viewer and settle back; the rest of the
// grid stays fully transparent, so the image box never looks filled. All CSS animation, no JS.

const cols = 40;
const rows = 40;
const pitch = 100 / cols;
const size = +(pitch * 0.74).toFixed(2);

// Deterministic pseudo-random, so every build produces the same SVG.
const rand = (n: number) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
};

// A cell only needs its position and one of a handful of timing classes. Sharing the timing
// (instead of writing two inline styles per cell) keeps the finer 40x40 grid from bloating the page:
// cells with the same class animate together, but they are scattered, so it still reads as random.
// The cells are plain <rect>s: Firefox doesn't animate CSS on elements that live in <defs>/<use>.
const timings = 48;
const timingCss: string[] = [];
for (let t = 0; t < timings; t++) {
    const duration = 2 + rand(t + 1000) * 1.6;
    const delay = -rand(t) * duration;
    timingCss.push(`.t${t}{animation-duration:${duration.toFixed(2)}s;animation-delay:${delay.toFixed(2)}s}`);
}

const cells: string[] = [];
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const t = Math.floor(rand(i + 2000) * timings);
        const x = (col * pitch + (pitch - size) / 2).toFixed(2);
        const y = (row * pitch + (pitch - size) / 2).toFixed(2);
        cells.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" class="t${t}"/>`);
    }
}

const style = 'rect{fill:#fef08a;opacity:0;transform-box:fill-box;transform-origin:center;' +
    'animation-name:lift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}' +
    timingCss.join('') +
    '@keyframes lift{0%,45%,100%{opacity:0;transform:scale(.9)}22%{opacity:.5;transform:scale(1.2)}}' +
    '@media (prefers-reduced-motion:reduce){rect{animation:none;opacity:.1;transform:none}}';

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' +
    `<style>${style}</style>` +
    cells.join('') +
    '</svg>';

export const loaderSvg = `data:image/svg+xml,${encodeURIComponent(svg)}`;
