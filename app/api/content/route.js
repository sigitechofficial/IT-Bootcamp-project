import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KV_KEY = 'landing:content';

// Default content structure
const defaultContent = {
    hero: {
        title: "Launch Your Tech Career in 5 Weeks.",
        subtitle: "Add real content from /admin",
        ctaText: "Reserve Your Seat",
        ctaLink: "#",
        backgroundImage: "",
        badge: "⚡ Limited seats for next cohort!",
    },
    sections: [],
};

// Map bootcamp-prefixed env vars to standard KV env vars that @vercel/kv expects
function setupKVEnvVars() {
    if (process.env.BOOTCAMP_KV_REST_API_URL && !process.env.KV_REST_API_URL) {
        process.env.KV_REST_API_URL = process.env.BOOTCAMP_KV_REST_API_URL;
    }
    if (process.env.BOOTCAMP_KV_REST_API_TOKEN && !process.env.KV_REST_API_TOKEN) {
        process.env.KV_REST_API_TOKEN = process.env.BOOTCAMP_KV_REST_API_TOKEN;
    }
}

// Helper to read from KV
async function readFromKV() {
    try {
        if (!process.env.BOOTCAMP_KV_REST_API_URL || !process.env.BOOTCAMP_KV_REST_API_TOKEN) {
            return defaultContent;
        }
        // Map bootcamp env vars to standard ones that @vercel/kv expects
        setupKVEnvVars();
        const content = await kv.get(KV_KEY);
        return content || defaultContent;
    } catch (err) {
        console.error('KV read failed:', err);
        return defaultContent;
    }
}

// GET handler to retrieve content
export async function GET() {
    try {
        const content = await readFromKV();
        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error reading content:', error);
        return NextResponse.json({ content: defaultContent });
    }
}

