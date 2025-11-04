"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState("");

  // fetch current content
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
        } else {
          // default shape
          setContent({
            hero: {
              title: "",
              subtitle: "",
              ctaText: "",
              ctaLink: "",
              backgroundImage: "",
              badge: "",
            },
            sections: [],
          });
        }
      } catch (error) {
        console.error("Error loading content:", error);
        // default shape on error
        setContent({
          hero: {
            title: "",
            subtitle: "",
            ctaText: "",
            ctaLink: "",
            backgroundImage: "",
            badge: "",
          },
          sections: [],
        });
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!content) return;
    if (!password) {
      setStatus("Failed ❌ Please enter the admin password");
      return;
    }
    setStatus("Saving...");
    try {
      const res = await fetch("/api/content/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-edit-password": password,
        },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Saved ✅");
      } else {
        // Show specific error message from API
        const errorMsg = data.error || `HTTP ${res.status}: Check password or data format`;
        setStatus(`Failed ❌ ${errorMsg}`);
      }
    } catch (error) {
      setStatus(`Failed ❌ ${error.message || "Network error. Make sure your dev server is running."}`);
    }
  }


  if (!content) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin – Bootcamp Landing</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Admin Password</label>
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="CONTENT_EDIT_PASSWORD"
        />
      </div>

      {/* hero fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Hero Title</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={content.hero?.title || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                hero: { ...prev.hero, title: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Hero Subtitle</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={content.hero?.subtitle || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                hero: { ...prev.hero, subtitle: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium">CTA Text</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={content.hero?.ctaText || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                hero: { ...prev.hero, ctaText: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium">CTA Link</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={content.hero?.ctaLink || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                hero: { ...prev.hero, ctaLink: e.target.value },
              }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Badge</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={content.hero?.badge || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                hero: { ...prev.hero, badge: e.target.value },
              }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Background Image URL (optional)</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={content.hero?.backgroundImage || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                hero: { ...prev.hero, backgroundImage: e.target.value },
              }))
            }
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-sky-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      {status ? <p className="text-sm">{status}</p> : null}

      <div>
        <p className="text-xs text-slate-500">
          Tip: this page saves everything to Vercel KV under key
          <code> &quot;landing:content&quot; </code>
        </p>
      </div>
    </div>
  );
}
