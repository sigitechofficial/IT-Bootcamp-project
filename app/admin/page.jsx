"use client";

import { useEffect, useState } from "react";
import { defaultContent } from "@/lib/constants";
import AdminPreviewHeader from "./AdminPreviewHeader";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import Footer from "@/app/components/Footer/Footer";

function normalizeContent(data) {
  const incoming = data || {};
  const headerData = incoming.header || {};
  const heroData = incoming.hero || {};
  const programOverviewData = incoming.programOverview || {};
  const faqData = incoming.faq || {};

  const mergedHeader = {
    ...defaultContent.header,
    ...headerData,
    logo: {
      ...defaultContent.header.logo,
      ...headerData.logo,
    },
    button: {
      ...defaultContent.header.button,
      ...headerData.button,
    },
    menu: Array.isArray(headerData.menu) ? headerData.menu : defaultContent.header.menu,
  };

  const mergedHero = {
    ...defaultContent.hero,
    ...heroData,
  };

  const mergedProgramOverview = {
    ...defaultContent.programOverview,
    ...programOverviewData,
    title: programOverviewData.title ?? defaultContent.programOverview.title,
    subtitle: programOverviewData.subtitle ?? defaultContent.programOverview.subtitle,
    whatYouLearn: Array.isArray(programOverviewData.whatYouLearn) && programOverviewData.whatYouLearn.length > 0
      ? programOverviewData.whatYouLearn
      : defaultContent.programOverview.whatYouLearn,
    benefits: Array.isArray(programOverviewData.benefits) && programOverviewData.benefits.length > 0
      ? programOverviewData.benefits
      : defaultContent.programOverview.benefits,
    outcomes: Array.isArray(programOverviewData.outcomes) && programOverviewData.outcomes.length > 0
      ? programOverviewData.outcomes
      : defaultContent.programOverview.outcomes,
  };

  const fallbackFaq = defaultContent.faq;
  const faqItems =
    Array.isArray(faqData.items) && faqData.items.length > 0
      ? faqData.items.map((item) => ({
        question: item?.question ?? "",
        answer: item?.answer ?? "",
      }))
      : fallbackFaq.items;

  const openCountRaw =
    typeof faqData.initialOpenCount === "number"
      ? faqData.initialOpenCount
      : fallbackFaq.initialOpenCount;

  const normalizedFaq = {
    ...fallbackFaq,
    ...faqData,
    items: faqItems,
    initialOpenCount: Math.min(Math.max(0, openCountRaw), faqItems.length),
  };

  return {
    ...defaultContent,
    ...incoming,
    header: mergedHeader,
    hero: mergedHero,
    programOverview: mergedProgramOverview,
    faq: normalizedFaq,
  };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [content, setContent] = useState(null);
  const [initialContent, setInitialContent] = useState(null);
  const [status, setStatus] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // fetch current content
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const response = await res.json();
        if (response.data) {
          const normalized = normalizeContent(response.data);
          setContent(normalized);
          setInitialContent(normalized);
        } else if (response.content) {
          // Fallback for old format
          const normalized = normalizeContent(response.content);
          setContent(normalized);
          setInitialContent(normalized);
        } else {
          // default to site defaults so preview matches home (shows logo, etc.)
          const normalized = normalizeContent(defaultContent);
          setContent(normalized);
          setInitialContent(normalized);
        }
      } catch (error) {
        console.error("Error loading content:", error);
        // default to site defaults on error as well
        const normalized = normalizeContent(defaultContent);
        setContent(normalized);
        setInitialContent(normalized);
      }
    }
    load();
  }, []);

  const isDirty = JSON.stringify(content) !== JSON.stringify(initialContent);

  async function handleLogoUpload(file) {
    if (!file) return;

    if (!password) {
      setStatus("❌ Please enter the admin password first before uploading files");
      return;
    }

    setUploadingLogo(true);
    setStatus("Uploading logo...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const oldLogoUrl = content.header?.logo?.image || "";
      if (oldLogoUrl && oldLogoUrl.startsWith("https://")) {
        formData.append("oldUrl", oldLogoUrl);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-edit-password": password,
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        setStatus(`Upload failed ❌ Server error (HTTP ${res.status}). Check console for details.`);
        setUploadingLogo(false);
        return;
      }

      if (res.ok) {
        setContent((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            logo: { ...prev.header?.logo, image: data.url },
          },
        }));
        setStatus("Logo uploaded ✅ (old logo replaced)");
      } else {
        setStatus(`Upload failed ❌ ${data.error || `HTTP ${res.status}: ${res.statusText}`}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus(`Upload failed ❌ ${error.message || "Network error. Check console for details."}`);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleUpload(file, type) {
    if (!file) return;

    // Check password before uploading
    if (!password) {
      setStatus("❌ Please enter the admin password first before uploading files");
      return;
    }

    const uploadState = type === "image" ? setUploadingImage : setUploadingVideo;
    uploadState(true);
    setStatus(`Uploading ${type}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Get old URLs to delete from Blob when replacing
      const oldImageUrl = content.hero?.backgroundImage || "";
      const oldVideoUrl = content.hero?.backgroundVideo || "";

      // When uploading image, delete old image AND old video (only one background allowed)
      // When uploading video, delete old video AND old image (only one background allowed)
      if (type === "image") {
        // Delete old image if exists
        if (oldImageUrl && oldImageUrl.startsWith("https://")) {
          formData.append("oldUrl", oldImageUrl);
        }
        // Also delete old video since we're replacing with image
        if (oldVideoUrl && oldVideoUrl.startsWith("https://")) {
          formData.append("oldUrl", oldVideoUrl);
        }
      } else {
        // Delete old video if exists
        if (oldVideoUrl && oldVideoUrl.startsWith("https://")) {
          formData.append("oldUrl", oldVideoUrl);
        }
        // Also delete old image since we're replacing with video
        if (oldImageUrl && oldImageUrl.startsWith("https://")) {
          formData.append("oldUrl", oldImageUrl);
        }
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-edit-password": password,
        },
        body: formData,
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // Response is HTML (error page), get text to see what happened
        const text = await res.text();
        console.error("Non-JSON response:", text);
        setStatus(`Upload failed ❌ Server error (HTTP ${res.status}). Check console for details.`);
        uploadState(false);
        return;
      }

      if (res.ok) {
        if (type === "image") {
          // Set new image and clear video (only one background at a time)
          setContent((prev) => ({
            ...prev,
            hero: {
              ...prev.hero,
              backgroundImage: data.url,
              backgroundVideo: "", // Clear video when image is uploaded
            },
          }));
          setStatus("Image uploaded ✅ (old background replaced)");
        } else {
          // Set new video and clear image (only one background at a time)
          setContent((prev) => ({
            ...prev,
            hero: {
              ...prev.hero,
              backgroundVideo: data.url,
              backgroundImage: "", // Clear image when video is uploaded
            },
          }));
          setStatus("Video uploaded ✅ (old background replaced)");
        }
      } else {
        setStatus(`Upload failed ❌ ${data.error || `HTTP ${res.status}: ${res.statusText}`}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus(`Upload failed ❌ ${error.message || "Network error. Check console for details."}`);
    } finally {
      uploadState(false);
    }
  }

  async function handleSave() {
    if (!content) return;
    if (!password) {
      setStatus("Failed ❌ Please enter the admin password");
      return;
    }
    setSaving(true);
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
        setInitialContent(content);
      } else {
        // Show specific error message from API
        const errorMsg = data.error || `HTTP ${res.status}: Check password or data format`;
        setStatus(`Failed ❌ ${errorMsg}`);
      }
    } catch (error) {
      setStatus(`Failed ❌ ${error.message || "Network error. Make sure your dev server is running."}`);
    } finally {
      setSaving(false);
    }
  }


  if (!content) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Live preview header with Save button */}
      <AdminPreviewHeader
        header={content?.header}
        onSave={handleSave}
        isDirty={isDirty}
        saving={saving}
        onChangeHeader={(patch) =>
          setContent((prev) => ({ ...prev, header: { ...prev.header, ...patch } }))
        }
        onUploadLogo={async (file) => {
          if (!password) {
            setStatus("❌ Please enter the admin password first before uploading files");
            return;
          }
          setUploadingLogo(true);
          try {
            const formData = new FormData();
            formData.append("file", file);
            const oldLogoUrl = content.header?.logo?.image || "";
            if (oldLogoUrl && oldLogoUrl.startsWith("https://")) {
              formData.append("oldUrl", oldLogoUrl);
            }
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "x-edit-password": password },
              body: formData,
            });
            const data = await res.json();
            if (res.ok && data?.url) {
              setContent((prev) => ({
                ...prev,
                header: {
                  ...prev.header,
                  logo: { ...prev.header?.logo, image: data.url },
                },
              }));
              setStatus("Logo uploaded ✅");
            } else {
              setStatus(`Upload failed ❌ ${data?.error || "Unknown error"}`);
            }
          } catch (e) {
            setStatus(`Upload failed ❌ ${e?.message || "Network error"}`);
          } finally {
            setUploadingLogo(false);
          }
        }}
      />

      {/* Live preview body mimicking home */}
      <main className="pt-24">
        <HeroSection hero={content?.hero} />
        {/* You can add more sections here to mirror home exactly */}
        <Footer />
      </main>

      {/* Editor panel */}
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

        {/* Header Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Header Section</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Logo Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Logo Image</label>
              <div className="space-y-2">
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo Image from Local
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const maxSize = 10 * 1024 * 1024; // 10MB
                          if (file.size > maxSize) {
                            setStatus(`File too large ❌ Maximum size: 10MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
                            return;
                          }
                          handleLogoUpload(file);
                        }
                      }}
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`inline-block px-4 py-2 rounded-md text-sm font-semibold cursor-pointer ${uploadingLogo
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90"
                        } transition-colors`}
                    >
                      {uploadingLogo ? "Uploading..." : "Choose Logo Image"}
                    </label>
                    {uploadingLogo && (
                      <span className="text-sm text-primary">⏳ Uploading...</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPEG, PNG, WebP, GIF (Max: 10MB)
                  </p>
                </div>

                {/* Or Manual URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste Logo Image URL
                  </label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full text-sm"
                    value={content.header?.logo?.image || ""}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          logo: { ...prev.header?.logo, image: e.target.value },
                        },
                      }))
                    }
                    placeholder="/images/logo.png or https://example.com/logo.png"
                  />
                </div>

                {/* Current Logo Display */}
                {content.header?.logo?.image && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Current Logo:</p>
                    <p className="text-xs text-gray-600 break-all mb-2">{content.header.logo.image}</p>
                    <img
                      src={content.header.logo.image}
                      alt="Logo Preview"
                      className="max-w-xs max-h-32 rounded border object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Logo Text (Fallback) */}
            <div>
              <label className="block text-sm font-medium">Logo Text (Fallback)</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={content.header?.logo?.text || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      logo: { ...prev.header?.logo, text: e.target.value },
                    },
                  }))
                }
                placeholder="ITJobNow"
              />
            </div>

            {/* Logo Link */}
            <div>
              <label className="block text-sm font-medium">Logo Link</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={content.header?.logo?.link || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      logo: { ...prev.header?.logo, link: e.target.value },
                    },
                  }))
                }
                placeholder="/"
              />
            </div>

            {/* Menu Items */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Navigation Menu</label>
              <div className="space-y-3">
                {(content.header?.menu || []).map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1 text-sm"
                      placeholder="Menu Label"
                      value={item.label || ""}
                      onChange={(e) => {
                        const newMenu = [...(content.header?.menu || [])];
                        newMenu[index] = { ...newMenu[index], label: e.target.value };
                        setContent((prev) => ({
                          ...prev,
                          header: { ...prev.header, menu: newMenu },
                        }));
                      }}
                    />
                    <input
                      type="text"
                      className="border rounded px-3 py-2 flex-1 text-sm"
                      placeholder="Menu Link"
                      value={item.link || ""}
                      onChange={(e) => {
                        const newMenu = [...(content.header?.menu || [])];
                        newMenu[index] = { ...newMenu[index], link: e.target.value };
                        setContent((prev) => ({
                          ...prev,
                          header: { ...prev.header, menu: newMenu },
                        }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newMenu = (content.header?.menu || []).filter((_, i) => i !== index);
                        setContent((prev) => ({
                          ...prev,
                          header: { ...prev.header, menu: newMenu },
                        }));
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newMenu = [...(content.header?.menu || []), { label: "", link: "" }];
                    setContent((prev) => ({
                      ...prev,
                      header: { ...prev.header, menu: newMenu },
                    }));
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  + Add Menu Item
                </button>
              </div>
            </div>

            {/* Header Button */}
            <div>
              <label className="block text-sm font-medium">Button Text</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={content.header?.button?.text || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      button: { ...prev.header?.button, text: e.target.value },
                    },
                  }))
                }
                placeholder="Enroll Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Button Link</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={content.header?.button?.link || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      button: { ...prev.header?.button, link: e.target.value },
                    },
                  }))
                }
                placeholder="#enroll"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Hero Section</h2>
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
            <label className="block text-sm font-medium mb-2">Background Image</label>
            <div className="space-y-2">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image from Local
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const maxSize = 10 * 1024 * 1024; // 10MB
                        if (file.size > maxSize) {
                          setStatus(`File too large ❌ Maximum size: 10MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
                          return;
                        }
                        handleUpload(file, "image");
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`inline-block px-4 py-2 rounded-md text-sm font-semibold cursor-pointer ${uploadingImage
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                      } transition-colors`}
                  >
                    {uploadingImage ? "Uploading..." : "Choose Image File"}
                  </label>
                  {uploadingImage && (
                    <span className="text-sm text-primary">⏳ Uploading...</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPEG, PNG, WebP, GIF (Max: 10MB)
                </p>
              </div>

              {/* Or Manual URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Paste Image URL
                </label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full text-sm"
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

              {/* Current Image Display */}
              {content.hero?.backgroundImage && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">Current Image:</p>
                  <p className="text-xs text-gray-600 break-all mb-2">{content.hero.backgroundImage}</p>
                  <img
                    src={content.hero.backgroundImage}
                    alt="Preview"
                    className="max-w-xs max-h-32 rounded border object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Background Video</label>
            <div className="space-y-2">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Video from Local (Recommended)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="video/*"
                    id="video-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size
                        const maxSize = 50 * 1024 * 1024; // 50MB
                        if (file.size > maxSize) {
                          setStatus(`File too large ❌ Maximum size: 50MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
                          return;
                        }
                        handleUpload(file, "video");
                      }
                    }}
                    disabled={uploadingVideo}
                  />
                  <label
                    htmlFor="video-upload"
                    className={`inline-block px-4 py-2 rounded-md text-sm font-semibold cursor-pointer ${uploadingVideo
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                      } transition-colors`}
                  >
                    {uploadingVideo ? "Uploading..." : "Choose Video File"}
                  </label>
                  {uploadingVideo && (
                    <span className="text-sm text-primary">⏳ Uploading...</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: MP4, WebM, OGG, QuickTime (Max: 50MB)
                </p>
              </div>

              {/* Or Manual URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Paste Video URL
                </label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full text-sm"
                  value={content.hero?.backgroundVideo || ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, backgroundVideo: e.target.value },
                    }))
                  }
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              {/* Current Video Display */}
              {content.hero?.backgroundVideo && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">Current Video:</p>
                  <p className="text-xs text-gray-600 break-all">{content.hero.backgroundVideo}</p>
                  {content.hero.backgroundVideo.match(/\.(mp4|webm|ogg|mov)$/i) && (
                    <video
                      src={content.hero.backgroundVideo}
                      controls
                      className="mt-2 w-full max-w-md rounded border"
                      style={{ maxHeight: "200px" }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Program Overview Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Program Overview</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={content.programOverview?.title || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    programOverview: { ...prev.programOverview, title: e.target.value },
                  }))
                }
                placeholder="Program Overview"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Subtitle</label>
              <textarea
                className="border rounded px-3 py-2 w-full text-sm min-h-[80px]"
                value={content.programOverview?.subtitle || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    programOverview: { ...prev.programOverview, subtitle: e.target.value },
                  }))
                }
                placeholder="Our curriculum is meticulously crafted..."
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* What You Learn */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">What You Learn</h3>
                {(content.programOverview?.whatYouLearn || []).map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      className="border rounded px-3 py-2 w-full text-sm"
                      value={item}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = Array.isArray(prev.programOverview?.whatYouLearn)
                            ? [...prev.programOverview.whatYouLearn]
                            : [];
                          next[index] = e.target.value;
                          return {
                            ...prev,
                            programOverview: { ...prev.programOverview, whatYouLearn: next },
                          };
                        })
                      }
                      placeholder="List item"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setContent((prev) => {
                          const current = Array.isArray(prev.programOverview?.whatYouLearn)
                            ? [...prev.programOverview.whatYouLearn]
                            : [];
                          const next = current.filter((_, i) => i !== index);
                          return {
                            ...prev,
                            programOverview: { ...prev.programOverview, whatYouLearn: next },
                          };
                        })
                      }
                      className="px-2 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => {
                      const current = Array.isArray(prev.programOverview?.whatYouLearn)
                        ? [...prev.programOverview.whatYouLearn]
                        : [];
                      return {
                        ...prev,
                        programOverview: {
                          ...prev.programOverview,
                          whatYouLearn: [...current, ""],
                        },
                      };
                    })
                  }
                  className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  + Add Item
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Benefits</h3>
                {(content.programOverview?.benefits || []).map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      className="border rounded px-3 py-2 w-full text-sm"
                      value={item}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = Array.isArray(prev.programOverview?.benefits)
                            ? [...prev.programOverview.benefits]
                            : [];
                          next[index] = e.target.value;
                          return {
                            ...prev,
                            programOverview: { ...prev.programOverview, benefits: next },
                          };
                        })
                      }
                      placeholder="List item"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setContent((prev) => {
                          const current = Array.isArray(prev.programOverview?.benefits)
                            ? [...prev.programOverview.benefits]
                            : [];
                          const next = current.filter((_, i) => i !== index);
                          return {
                            ...prev,
                            programOverview: { ...prev.programOverview, benefits: next },
                          };
                        })
                      }
                      className="px-2 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => {
                      const current = Array.isArray(prev.programOverview?.benefits)
                        ? [...prev.programOverview.benefits]
                        : [];
                      return {
                        ...prev,
                        programOverview: {
                          ...prev.programOverview,
                          benefits: [...current, ""],
                        },
                      };
                    })
                  }
                  className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  + Add Item
                </button>
              </div>

              {/* Outcomes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Outcomes</h3>
                {(content.programOverview?.outcomes || []).map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      className="border rounded px-3 py-2 w-full text-sm"
                      value={item}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = Array.isArray(prev.programOverview?.outcomes)
                            ? [...prev.programOverview.outcomes]
                            : [];
                          next[index] = e.target.value;
                          return {
                            ...prev,
                            programOverview: { ...prev.programOverview, outcomes: next },
                          };
                        })
                      }
                      placeholder="List item"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setContent((prev) => {
                          const current = Array.isArray(prev.programOverview?.outcomes)
                            ? [...prev.programOverview.outcomes]
                            : [];
                          const next = current.filter((_, i) => i !== index);
                          return {
                            ...prev,
                            programOverview: { ...prev.programOverview, outcomes: next },
                          };
                        })
                      }
                      className="px-2 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => {
                      const current = Array.isArray(prev.programOverview?.outcomes)
                        ? [...prev.programOverview.outcomes]
                        : [];
                      return {
                        ...prev,
                        programOverview: {
                          ...prev.programOverview,
                          outcomes: [...current, ""],
                        },
                      };
                    })
                  }
                  className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  + Add Item
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">FAQ Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Section Title</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={content.faq?.title || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, title: e.target.value },
                  }))
                }
                placeholder="Frequently Asked Questions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Section Description</label>
              <textarea
                className="border rounded px-3 py-2 w-full text-sm min-h-[100px]"
                value={content.faq?.description || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, description: e.target.value },
                  }))
                }
                placeholder="Explore our FAQs to learn more..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Default Open Items</label>
              <input
                type="number"
                min={0}
                max={content.faq?.items?.length || 0}
                className="border rounded px-3 py-2 w-full md:w-40"
                value={content.faq?.initialOpenCount ?? 0}
                onChange={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  setContent((prev) => {
                    const itemsLength = Array.isArray(prev.faq?.items) ? prev.faq.items.length : 0;
                    const safeValue = Number.isNaN(raw) ? 0 : Math.max(0, raw);
                    const clamped = Math.min(safeValue, itemsLength);
                    return {
                      ...prev,
                      faq: { ...prev.faq, initialOpenCount: clamped },
                    };
                  });
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Controls how many questions start expanded (max equals total FAQs).
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium">FAQ Items</label>
              {(content.faq?.items || []).map((item, index) => {
                const itemsLength = content.faq?.items?.length || 0;
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        FAQ #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((prev) => {
                            const currentItems = Array.isArray(prev.faq?.items)
                              ? [...prev.faq.items]
                              : [];
                            if (currentItems.length <= 1) {
                              return prev;
                            }
                            const nextItems = currentItems.filter((_, i) => i !== index);
                            const adjustedOpenCount = Math.min(
                              prev.faq?.initialOpenCount ?? 0,
                              nextItems.length
                            );
                            return {
                              ...prev,
                              faq: {
                                ...prev.faq,
                                items: nextItems,
                                initialOpenCount: adjustedOpenCount,
                              },
                            };
                          })
                        }
                        className={`px-3 py-1 rounded text-sm ${itemsLength <= 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        disabled={itemsLength <= 1}
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Question
                      </label>
                      <input
                        className="border rounded px-3 py-2 w-full text-sm"
                        value={item.question || ""}
                        onChange={(e) =>
                          setContent((prev) => {
                            const nextItems = Array.isArray(prev.faq?.items)
                              ? [...prev.faq.items]
                              : [];
                            nextItems[index] = {
                              ...nextItems[index],
                              question: e.target.value,
                            };
                            return {
                              ...prev,
                              faq: { ...prev.faq, items: nextItems },
                            };
                          })
                        }
                        placeholder="Enter question"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Answer
                      </label>
                      <textarea
                        className="border rounded px-3 py-2 w-full text-sm min-h-[80px]"
                        value={item.answer || ""}
                        onChange={(e) =>
                          setContent((prev) => {
                            const nextItems = Array.isArray(prev.faq?.items)
                              ? [...prev.faq.items]
                              : [];
                            nextItems[index] = {
                              ...nextItems[index],
                              answer: e.target.value,
                            };
                            return {
                              ...prev,
                              faq: { ...prev.faq, items: nextItems },
                            };
                          })
                        }
                        placeholder="Enter answer"
                      />
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setContent((prev) => {
                    const currentItems = Array.isArray(prev.faq?.items)
                      ? [...prev.faq.items]
                      : [];
                    const nextItems = [
                      ...currentItems,
                      {
                        question: "",
                        answer: "",
                      },
                    ];
                    const adjustedOpenCount = Math.min(
                      prev.faq?.initialOpenCount ?? defaultContent.faq.initialOpenCount,
                      nextItems.length
                    );
                    return {
                      ...prev,
                      faq: {
                        ...prev.faq,
                        items: nextItems,
                        initialOpenCount: adjustedOpenCount,
                      },
                    };
                  })
                }
                className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                + Add FAQ Item
              </button>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={!isDirty || saving} className={`px-4 py-2 rounded ${!isDirty || saving ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-sky-600 text-white"}`}>
          {saving ? "Saving..." : "Save"}
        </button>

        {status ? <p className="text-sm">{status}</p> : null}

        <div>
          <p className="text-xs text-slate-500">
            Tip: this page saves everything to Vercel KV under key
            <code> &quot;landing:content&quot; </code>
          </p>
        </div>
      </div>
    </div>
  );
}
