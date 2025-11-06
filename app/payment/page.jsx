import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";

const COURSE_NAME = "UI/UX Designer Professional";

// Bootcamp cycles data - should match the data in EnrollToCourse
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

export default function PaymentPage({ searchParams }) {
    const cycleId = searchParams?.cycle || "current";

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    const selectedCycleData = bootcampCycles.find(cycle => cycle.id === cycleId) || bootcampCycles[0];

    return (
        <main className="min-h-screen">
            <Header />
            <div className="mt-20 py-16 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black font-switzer">
                            Secure Payment
                        </h2>
                        <p className="text-lg text-gray-600">
                            Complete your booking securely. Your details are protected.
                        </p>
                    </div>

                    {/* Course Details Box */}
                    <div className="bg-primary rounded-lg p-6 md:p-8 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Left: Course Info */}
                            <div className="text-white">
                                <p className="text-sm mb-2 opacity-90">Course</p>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                    {COURSE_NAME}
                                </h3>
                                <p className="text-sm mb-2 opacity-90">Course Cycle</p>
                                <p className="text-lg">
                                    {selectedCycleData.title} ({formatShortDate(selectedCycleData.startDate)} - {formatShortDate(selectedCycleData.endDate)})
                                </p>
                            </div>

                            {/* Right: Payment Info */}
                            <div className="text-white flex flex-col justify-center">
                                <p className="text-sm mb-2 opacity-90">One-time Payment</p>
                                <p className="text-3xl md:text-4xl font-bold">
                                    {selectedCycleData.price}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* User Information Form */}
                    <div className="mb-8">
                        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-black">
                            User Information:
                        </h3>
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-black font-semibold mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-black font-semibold mb-2">
                                        Phone number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-black font-semibold mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter country"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-black font-semibold mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter Email"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-black font-semibold mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Address"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-black font-semibold mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter City"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Next Button */}
                    <div className="text-center">
                        <button className="w-full bg-primary text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

