"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

export default function EnrollToCourse() {
    const router = useRouter();
    const [selectedCycle, setSelectedCycle] = useState("current");

    const bootcampCycles = [
        {
            id: "current",
            title: "Current Bootcamp Cycle",
            recommended: true,
            price: "$220.00",
            priceLabel: "one-time",
            startDate: "March 15, 2025",
            endDate: "April 19, 2025",
            duration: "5-Week Intensive",
        },
        {
            id: "next",
            title: "Next Bootcamp Cycle",
            recommended: false,
            price: "$220.00",
            priceLabel: "one-time",
            startDate: "May 15, 2025",
            endDate: "June 19, 2025",
            duration: "5-Week Intensive",
        },
    ];

    const handleSelectCycle = (cycleId) => {
        setSelectedCycle(cycleId);
        router.push(`/payment?cycle=${cycleId}`);
    };

    return (
        <main className="min-h-screen">
            <div className="mt-20 py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black font-switzer">
                            Enroll In our IT Bootcamp
                        </h1>
                        <p className="text-lg text-gray-600">
                            Choose your bootcamp cycle and get started today.
                        </p>
                    </div>

                    {/* Bootcamp Cycle Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                        {bootcampCycles.map((cycle) => (
                            <div
                                key={cycle.id}
                                className="relative bg-gray-100 rounded-lg p-6 md:p-8"
                            >
                                {/* Recommended Badge */}
                                {cycle.recommended && (
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Recommended
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-black mb-4">
                                    {cycle.title}
                                </h3>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-black">
                                        {cycle.price}
                                    </span>
                                    <span className="text-black ml-2">{cycle.priceLabel}</span>
                                </div>

                                {/* Selection Button */}
                                <button
                                    onClick={() => handleSelectCycle(cycle.id)}
                                    className={`w-full py-3 rounded-lg font-semibold mb-6 transition-colors ${selectedCycle === cycle.id
                                        ? "bg-primary text-white"
                                        : "bg-gray-300 text-white border border-gray-400"
                                        }`}
                                >
                                    Selected
                                </button>

                                {/* Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <IoIosCheckmarkCircleOutline
                                            size={20}
                                            color="#6B7280"
                                            opacity={0.7}
                                        />
                                        <span className="text-gray-700">
                                            Start Date: {cycle.startDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <IoIosCheckmarkCircleOutline
                                            size={20}
                                            color="#6B7280"
                                            opacity={0.7}
                                        />
                                        <span className="text-gray-700">
                                            End Date: {cycle.endDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <IoIosCheckmarkCircleOutline
                                            size={20}
                                            color="#6B7280"
                                            opacity={0.7}
                                        />
                                        <span className="text-gray-700">{cycle.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Text */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                            One-time payment. Include all course material and access to our
                            learning platform.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

