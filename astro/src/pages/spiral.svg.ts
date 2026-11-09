// Black and yellow (palette yellow-200) hypnotic spiral shown behind images while they load (Img.astro, .loading-spiral in input.css),
// generated at build time into one static /spiral.svg. It spins by itself (CSS inside the SVG), which looks like
// endlessly falling inwards, so it also works as a plain CSS background.
//
// It's a logarithmic spiral band: at each angle the black band runs from the spiral's radius half a turn
// back to its current radius, so black and white stripes alternate and get wider towards the edge.
import type { APIRoute } from 'astro';

const growth = 1.5; // how much the radius grows per turn
const b = Math.log(growth) / (2 * Math.PI);
const rMin = 0.2;
const rMax = 90; // past the corners (r ≈ 71) even for the band's inner edge, so stripes reach the edges
const thetaMax = Math.log(rMax / rMin) / b;

const xy = (x: number, y: number) => `${(50 + x).toFixed(2)} ${(50 + y).toFixed(2)}`;

// One edge of the band as cubic Bézier curves, every 30° from angle `from` to `to` (either direction).
// `shift` turns the spiral: 0 for the outer edge, -π for the inner one. Control points come from the
// spiral's tangent, so the curve stays smooth at any size with few segments.
const step = Math.PI / 6;
const edge = (from: number, to: number, shift: number) => {
    const at = (t: number) => {
        const r = rMin * Math.exp(b * (t + shift));
        const [c, s] = [Math.cos(t), Math.sin(t)];
        return { x: r * c, y: r * s, dx: r * (b * c - s), dy: r * (b * s + c) };
    };
    const n = Math.ceil(Math.abs(to - from) / step);
    const h = (to - from) / n;
    let d = '';
    for (let i = 0; i < n; i++) {
        const p0 = at(from + i * h), p1 = at(from + (i + 1) * h);
        d += ` C${xy(p0.x + (h / 3) * p0.dx, p0.y + (h / 3) * p0.dy)} ${xy(p1.x - (h / 3) * p1.dx, p1.y - (h / 3) * p1.dy)} ${xy(p1.x, p1.y)}`;
    }
    return d;
};

const start = rMin; // the outer edge starts at angle 0, radius rMin
const end = rMin * Math.exp(b * (thetaMax - Math.PI)); // where the inner edge ends at thetaMax
const path = `M${xy(start, 0)}${edge(0, thetaMax, 0)} L${xy(end * Math.cos(thetaMax), end * Math.sin(thetaMax))}${edge(thetaMax, 0, -Math.PI)} Z`;

// The stripes reach r ≈ 73 at every angle, past the corners (≈ 71), so rotating never shows a gap.
const style = 'path{transform-origin:50px 50px;animation:spin 2s linear infinite}' +
    '@keyframes spin{to{transform:rotate(1turn)}}' +
    '@media (prefers-reduced-motion:reduce){path{animation:none}}';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">` +
    `<style>${style}</style>` +
    `<rect width="100" height="100" fill="#fef08a"/>` + // yellow-200, like the { } logo
    `<path fill="#000" d="${path}"/>` +
    `</svg>`;

export const GET: APIRoute = () => new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
