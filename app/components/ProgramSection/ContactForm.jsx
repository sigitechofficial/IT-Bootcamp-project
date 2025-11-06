"use client";

import { useState } from "react";
import Input from "./Input";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
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
        <section className="py-16 px-4 bg-[#F6F9FC]">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-2xl mx-auto">
                    {/* Form Card */}
                    <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
                        {/* Form Header */}
                        <h2 className="text-3xl md:text-[40px] font-bold text-center mb-10 text-black font-switzer">
                            Have Questions? Send us a Message
                        </h2>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
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
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                value={formData.email}
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

                            <Input
                                label="Description"
                                type="textarea"
                                name="description"
                                placeholder="Write here."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

