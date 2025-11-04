import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req) {
    const password = req.headers.get("x-edit-password");
    console.log("*********password", password);
    if (password !== "123456") {
        console.log("*********unauthorized");
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
        return Response.json({ error: "No file" }, { status: 400 });
    }

    const blob = await put(`bootcamp-${Date.now()}-${file.name}`, file, {
        access: "public",
    });

    return Response.json({ url: blob.url });
}
