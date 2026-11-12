// Faint yellow grid shown behind images while they load (Img.astro, .loading-grid in input.css).
// It is inlined as a data URI, so the loader costs no extra request (which the old /spiral.svg did).
// Inside the SVG, each square rises towards the viewer and settles back, in a ripple from the centre;
// all of it is CSS animation, no JS. The squares are transparent between pulses.

const cols = 12;
const rows = 12;
const pitch = 100 / cols;
const size = pitch - 2.2;
const duration = 2.4;
const step = 0.18;

const cells: string[] = [];
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const dx = col - (cols - 1) / 2;
        const dy = row - (rows - 1) / 2;
        const delay = (-Math.hypot(dx, dy) * step).toFixed(2);
        const x = (col * pitch + (pitch - size) / 2).toFixed(2);
        const y = (row * pitch + (pitch - size) / 2).toFixed(2);
        cells.push(`<rect x="${x}" y="${y}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" style="animation-delay:${delay}s"/>`);
    }
}

const style = 'rect{fill:#fef08a;opacity:.06;transform-box:fill-box;transform-origin:center;' +
    `animation:lift ${duration}s ease-in-out infinite}` +
    '@keyframes lift{0%,100%{opacity:.06;transform:scale(.7)}40%{opacity:.45;transform:scale(1.15)}70%{opacity:.06;transform:scale(.7)}}' +
    '@media (prefers-reduced-motion:reduce){rect{animation:none;opacity:.16;transform:none}}';

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' +
    `<style>${style}</style>` +
    cells.join('') +
    '</svg>';

export const loaderSvg = `data:image/svg+xml,${encodeURIComponent(svg)}`;
