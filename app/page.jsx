import { kv } from "@vercel/kv";
import { defaultContent, KV_KEY } from "@/lib/constants";
import Header from "@/app/components/Header/Header";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import ProgramOverview from "@/app/components/ProgramSection/ProgramOverview";
import Footer from "@/app/components/Footer/Footer";

export default async function Home() {
    let content = null;
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            content = await kv.get(KV_KEY);
        } catch (error) {
            console.error("KV error:", error);
        }
    }
    const finalContent = content || defaultContent;
    console.log(finalContent, "finalContentfinalContent");
    const hero = finalContent.hero || defaultContent.hero;
    const faq = finalContent.faq || defaultContent.faq;

    return (
        <main className="min-h-screen">
            <Header />
            <HeroSection hero={hero} />

            <ProgramOverview faq={faq} />
            <Footer />
        </main>
    );
}

