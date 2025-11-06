"use client";

import { useState } from "react";
import Input from "@/app/components/ProgramSection/Input";

export default function ContactUsHeroSection({ backgroundImage, backgroundVideo }) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        subject: "",
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log("Form submitted:", formData);
        // You can add API call or other logic here
    };

    return (
        <section className="relative flex items-center justify-center overflow-hidden mt-20 py-16 md:py-16">
            {/* Background Video/Image */}
            <div className="absolute top-0 left-0 inset-0">
                {backgroundVideo ? (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src={backgroundVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : backgroundImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={backgroundImage}
                        alt="Contact background"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
                )}
            </div>

            <div className="absolute left-0 top-0 inset-0 bg-black/50" />



            {/* Form Content */}
            <div className="relative z-10 w-full max-w-3xl mx-auto px-4">
                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 md:px-6 py-8">
                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black font-switzer">
                            Get In Touch With Us
                        </h2>
                        <p className="text-lg text-black/70">
                            Have questions? We&apos;re here to help you before, during, and after your bootcamp journey.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div>
                                <Input
                                    label="Full Name"
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Enter phone number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Right Column */}
                            <div>
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Subject"
                                    type="text"
                                    name="subject"
                                    placeholder="General Inquiry"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description - Full Width */}
                        <div className="mt-6">
                            <Input
                                label="Description"
                                type="textarea"
                                name="description"
                                placeholder="Write here."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Submit Button - Full Width */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

