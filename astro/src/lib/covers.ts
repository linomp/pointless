// Placeholder image for YouTube embeds, fetched from YouTube at build time.
// Astro downloads and optimizes it, so visitors only load the self-hosted copy.
// (Bandcamp has no public image URL for its players, so those entries keep a "cover:" file.)

export interface RemoteCover {
    src: string;
    width: number;
    height: number;
}

// Largest thumbnail YouTube has. maxresdefault (1280x720) doesn't exist for every video;
// hqdefault (480x360) always does but has black bars, which the 16:9 crop removes.
export async function youtubeCover(embedSrc: string): Promise<RemoteCover> {
    const id = new URL(embedSrc).pathname.split('/').pop();
    const maxres = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    if ((await fetch(maxres, { method: 'HEAD' })).ok) return { src: maxres, width: 800, height: 450 };
    return { src: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, width: 480, height: 270 };
}
