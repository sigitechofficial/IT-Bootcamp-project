import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KV_KEY = 'landing:content';

// Map bootcamp-prefixed env vars to standard KV env vars that @vercel/kv expects
function setupKVEnvVars() {
    if (process.env.BOOTCAMP_KV_REST_API_URL && !process.env.KV_REST_API_URL) {
        process.env.KV_REST_API_URL = process.env.BOOTCAMP_KV_REST_API_URL;
    }
    if (process.env.BOOTCAMP_KV_REST_API_TOKEN && !process.env.KV_REST_API_TOKEN) {
        process.env.KV_REST_API_TOKEN = process.env.BOOTCAMP_KV_REST_API_TOKEN;
    }
}

// Helper to write to KV
async function writeToKV(data) {
    try {
        if (!process.env.BOOTCAMP_KV_REST_API_URL || !process.env.BOOTCAMP_KV_REST_API_TOKEN) {
            throw new Error('KV storage is not configured');
        }
        // Map bootcamp env vars to standard ones that @vercel/kv expects
        setupKVEnvVars();
        await kv.set(KV_KEY, data);
    } catch (err) {
        console.error('KV write failed:', err);
        throw err;
    }
}

// POST handler to update content
export async function POST(request) {
    try {
        // Check authorization
        const password = request.headers.get("x-edit-password");

        if (password !== process.env.CONTENT_EDIT_PASSWORD) {
            console.log(password, "passwordpassword");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Validate data structure
        if (!data || !data.hero) {
            return NextResponse.json(
                { error: 'Invalid data format. Content must include a hero object.' },
                { status: 400 }
            );
        }

        console.log(data, "datadatadata");

        // Write to KV
        await writeToKV(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating content:', error);

        if (error.message === 'KV storage is not configured') {
            return NextResponse.json(
                { error: 'KV storage is not configured. Please set BOOTCAMP_KV_REST_API_URL and BOOTCAMP_KV_REST_API_TOKEN environment variables.' },
                { status: 500 }
            );
        }

        // Return more specific error message
        return NextResponse.json(
            { error: `Failed to update content: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
