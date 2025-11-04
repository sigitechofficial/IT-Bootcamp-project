import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KV_KEY = 'landing:content';

// Default content structure
const defaultContent = {
    hero: {
        title: "Launch Your Tech Career in 5 Weekssss.",
        subtitle: "Add real content from /admin",
        ctaText: "Reserve Your Seat",
        ctaLink: "#",
        backgroundImage: "",
        badge: "⚡ Limited seats for next cohort!",
    },
    sections: [],
};

async function readFromKV() {
    try {
        if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            return defaultContent;
        }
        const content = await kv.get(KV_KEY);
        return content || defaultContent;
    } catch (err) {
        console.error('KV read failed:', err);
        return defaultContent;
    }
}

export async function GET() {
    try {
        const content = await readFromKV();
        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error reading content:', error);
        return NextResponse.json({ content: defaultContent });
    }
}

