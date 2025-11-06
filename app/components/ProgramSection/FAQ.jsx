"use client";

import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function FAQSection() {
    // First 3 items open by default (indices 0, 1, 2)
    const [openIndices, setOpenIndices] = useState([0, 1, 2]);

    const faqs = [
        {
            question: "Do I need prior IT knowledge?",
            answer: "No. The bootcamp is designed for complete beginners.",
        },
        {
            question: "Is this online or in-person?",
            answer: "It's fully in-person at our training center.",
        },
        {
            question: "What if I miss a class?",
            answer: "You can attend the makeup session in the next cycle.",
        },
        {
            question: "Will I get a certificate?",
            answer: "Yes, upon successful completion of the bootcamp, you will receive a certificate of completion.",
        },
        {
            question: "Can I pay in installments?",
            answer: "Yes, we offer flexible payment plans. Please contact us for more details.",
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndices((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold mb-4 text-black font-switzer">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-black/70  mx-auto">
                        Explore our FAQs to learn more about how we work, what we offer, and how we can help you.
                    </p>
                </div>

                {/* FAQ Accordion Container */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndices.includes(index);
                            return (
                                <div key={index}>
                                    {/* FAQ Item */}
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-lg md:text-xl font-bold text-black pr-4">
                                            {faq.question}
                                        </span>
                                        <div className="shrink-0">
                                            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg">
                                                {isOpen ? (
                                                    <FaMinus className="text-white text-sm" />
                                                ) : (
                                                    <FaPlus className="text-white text-sm" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Answer */}
                                    {isOpen && (
                                        <div className="px-6 pb-5">
                                            <p className="text-lg text-black/70">{faq.answer}</p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    {index < faqs.length - 1 && (
                                        <div className="border-t border-gray-200"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

