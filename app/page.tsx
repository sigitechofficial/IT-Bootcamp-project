import { kv } from "@vercel/kv";
import Image from "next/image";

type ContentSection = {
  title: string;
  items?: string[];
};

type ContentData = {
  hero?: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
    badge?: string;
  };
  sections?: ContentSection[];
};

export default async function Home() {
  // Check if KV is configured, if not use fallback defaults
  let content: ContentData | null = null;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      content = (await kv.get("landing:content")) as ContentData | null;
    } catch (error) {
      console.error("KV error:", error);
      // Continue with fallback defaults
    }
  }

  const hero = content?.hero || {
    title: "Launch Your Tech Career in 5 Weeks.",
    subtitle: "Add real content from /admin",
    ctaText: "Reserve Your Seat",
    ctaLink: "#",
    backgroundImage: "",
    badge: "⚡ Limited seats for next cohort!",
  };

  return (
    <main className="min-h-screen">
      {/* navbar */}
      <header className="w-full fixed top-0 left-0 bg-white/80 backdrop-blur border-b z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-sky-600">ITJobNow</div>
          <nav className="hidden md:flex gap-6 text-sm text-slate-700">
            <a href="#courses">Courses</a>
            <a href="#contact">Contact</a>
            <a href="/admin" className="text-slate-500">
              Admin
            </a>
          </nav>
          <a
            href={hero.ctaLink}
            className="bg-sky-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Enroll Now
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="relative h-[520px] mt-[64px] flex items-center">
        {hero.backgroundImage ? (
          <Image
            src={hero.backgroundImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-slate-900" />
        )}
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative max-w-5xl mx-auto px-4 text-white">
          {hero.badge ? (
            <p className="mb-3 text-sm text-orange-200">{hero.badge}</p>
          ) : null}
          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl mb-4">
            {hero.title}
          </h1>
          <p className="text-lg max-w-xl mb-6">{hero.subtitle}</p>
          <a
            href={hero.ctaLink}
            className="bg-sky-500 hover:bg-sky-400 px-6 py-3 rounded-md font-semibold"
          >
            {hero.ctaText}
          </a>
        </div>
      </section>

      {/* extra sections if present */}
      {content?.sections && content.sections.length > 0 ? (
        <section className="max-w-6xl mx-auto px-4 py-12 space-y-6">
          {content.sections.map((section: ContentSection, idx: number) => (
            <div key={idx}>
              <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
              <ul className="list-disc list-inside text-slate-700">
                {section.items?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}
