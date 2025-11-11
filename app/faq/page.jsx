"use client";

import { useEffect, useState } from "react";
import FAQSection from "@/app/components/ProgramSection/FAQ";
import { defaultContent } from "@/lib/constants";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";

export default function FaqPage() {
  const [faq, setFaq] = useState(defaultContent.faq);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json?.data || json?.content || defaultContent;
        if (!ignore) setFaq(data.faq || defaultContent.faq);
      } catch {
        if (!ignore) setFaq(defaultContent.faq);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Keep same UX as on home by reusing FAQSection
  return (
    <main className="pt-24">
      <Header />
      <FAQSection key={`${faq?.items?.length || 0}-${faq?.initialOpenCount || 0}`} faq={faq} />
      <Footer />
    </main>
  );
}

