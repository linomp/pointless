import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One markdown file per embed on the music page; the body is the "Details" text.
// The cover image sits next to the markdown file.
const music = defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/music' }),
    schema: ({ image }) => z.object({
        section: z.enum(['projects', 'recommended']),
        order: z.number(),
        kind: z.enum(['youtube', 'bandcamp']),
        src: z.url(),
        cover: image(),
        fallback: z.object({ href: z.url(), text: z.string() }).optional(),
    }),
});

// One markdown file (frontmatter only) per gallery photo, photo next to it.
const gallery = defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/gallery' }),
    schema: ({ image }) => z.object({
        order: z.number(),
        title: z.string(),
        caption: z.string(),
        photo: image(),
    }),
});

export const collections = { music, gallery };
