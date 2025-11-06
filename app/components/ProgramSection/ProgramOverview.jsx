import Image from "next/image";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { FaGlobe, FaGraduationCap, FaUsers, FaYoutube, FaChevronRight } from "react-icons/fa";
import FAQSection from "./FAQ";
import ContactForm from "./ContactForm";

export default function ProgramOverview() {
    const whatYouLearn = [
        "Full stack Development",
        "Agile Methodologies",
        "Version Control with Git",
        "Cloud Fundamental",
    ];

    const benefits = [
        "Hands-on, project-Based",
        "Expert-Led Instruction",
        "Career Placement Support",
        "Small class sizes",
    ];

    const outcomes = [
        "Job-Ready in 5 weeks",
        "Professionals Portfolio",
        "Industry Connections",
        "Certificate of completion",
    ];

    return (
        <>
            <section className="py-16 px-4 bg-[#F6F9FC]">
                <div className="max-w-7xl mx-auto">
                    {/* Title */}
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-center mb-6 text-black font-switzer">
                        Program Overview
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-center text-black max-w-2xl px-5 mx-auto mb-12">
                        Our curriculum is meticulously crafted to provide you with the skills
                        and support you need to thrive in the tech industry.
                    </p>

                    {/* Three Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-[1200px] mx-auto">
                        {/* Column 1: What You Learn */}
                        <div>
                            <h3 className="text-3xl font-bold text-black mb-6">
                                What You Learn
                            </h3>
                            <ul className="space-y-4">
                                {whatYouLearn.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3 ">
                                        <IoIosCheckmarkCircleOutline size={24} color="#0E9013" opacity={0.5} />
                                        <span className="text-black/70 text-xl">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 2: Benefits */}
                        <div>
                            <h3 className="text-3xl font-bold text-black mb-6">Benefits</h3>
                            <ul className="space-y-4">
                                {benefits.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <IoIosCheckmarkCircleOutline size={24} color="#0E9013" opacity={0.5} />
                                        <span className="text-black/70 text-xl">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Outcomes */}
                        <div>
                            <h3 className="text-3xl font-bold text-black mb-6">Outcomes</h3>
                            <ul className="space-y-4">
                                {outcomes.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <IoIosCheckmarkCircleOutline size={24} color="#0E9013" opacity={0.5} />
                                        <span className="text-black/70 text-xl">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Details, Duration & Pricing Section */}
            <section className="py-16 px-4 bg-[#F6F9FC]">
                <div className="max-w-[879px] mx-auto">
                    {/* Main Title */}
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-center mb-12 text-black font-switzer">
                        Course Details, Duration & Pricing
                    </h2>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                        {/* Left: Course Details */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-black mb-2">Duration</h3>
                                <p className="text-lg text-black/70">5 week Intensive</p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-black mb-2">Schedule</h3>
                                <p className="text-lg text-black/70">Full-Time: Mon-Fri, 9am - 5pm</p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-black mb-4">Duration</h3>
                                <ul className="space-y-2">
                                    <li className="text-lg text-black/70">October 28, 2025</li>
                                    <li className="text-lg text-black/70">January 6, 2026</li>
                                </ul>
                            </div>
                        </div>

                        {/* Right: Pricing Box */}
                        <div className="flex items-start justify-center lg:justify-end">
                            <div className="bg-primary rounded-lg p-8 w-full max-w-md">
                                <p className="text-white text-center text-lg mb-4">Pricing</p>
                                <div className="flex items-baseline justify-center gap-2 mb-6">
                                    <span className="text-5xl md:text-6xl font-bold text-white">$220</span>
                                    <span className="text-white text-lg">One-Time</span>
                                </div>
                                <button className="w-full bg-white text-primary py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                                    Reserve Your Seat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose ITJobNow? Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Main Title */}
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-center mb-12 text-black font-switzer">
                        Why Choose ITJobNow?
                    </h2>

                    {/* Three Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
                        {/* Column 1: Immersive Learning Method */}
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                                    <FaGlobe className="text-primary text-4xl" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Immersive Learning Method
                            </h3>
                            <p className="text-lg text-black/70">
                                Our &apos;Learn-by-doing&apos; approach means you&apos;ll spend over 80% of your time on practice, hand-on coding projects that simulate real-world job task.
                            </p>
                        </div>

                        {/* Column 2: Lifetime Career Support */}
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                                    <FaGraduationCap className="text-primary text-4xl" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Lifetime Career Support
                            </h3>
                            <p className="text-lg text-black/70">
                                Our &apos;Learn-by-doing&apos; approach means you&apos;ll spend over 80% of your time on practice, hand-on coding projects that simulate real-world job task.
                            </p>
                        </div>

                        {/* Column 3: Vibrant Community */}
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                                    <FaUsers className="text-primary text-4xl" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Vibrant Community
                            </h3>
                            <p className="text-lg text-black/70">
                                Our &apos;Learn-by-doing&apos; approach means you&apos;ll spend over 80% of your time on practice, hand-on coding projects that simulate real-world job task.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* YouTube Card Section */}
            <section className="py-16 px-4 bg-[#F6F9FC]">
                <div className="max-w-[1214px] mx-auto">
                    <div className="bg-white rounded-lg   md:px-4 py-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-sm w-full mx-auto">
                        {/* YouTube Logo */}
                        <div className="shrink-0">
                            <FaYoutube className="text-red-600 text-6xl md:text-7xl" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                                Not sure if this is for you?
                            </h3>
                            <p className="text-lg text-black/70">
                                Watch Our YouTube channel to see if this course is right for you.
                            </p>
                        </div>

                        {/* Chevron Icon */}
                        <div className="shrink-0">
                            <FaChevronRight className="text-gray-600 text-2xl" />
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-16 px-4 bg-primary relative">
                <div className=" mx-auto relative">
                    <div className="text-center text-white  mx-auto">
                        <h2 className="text-[52px] font-bold mb-4">
                            Ready to Launch Your IT Career?
                        </h2>
                        <p className="text-lg md:text-xl mb-8">
                            Your future in tech start here. Reserve your seat for the next cohort.
                        </p>
                        <button className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                            Reserve Your Seat
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-[1380px] mx-auto">
                    {/* Title */}
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-center mb-12 text-black font-switzer">
                        What Our Students Say
                    </h2>

                    {/* Testimonial Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mx-auto">
                        {/* Testimonial 1 - Marco */}
                        <div className="bg-gray-100 rounded-lg p-6 md:p-8 text-center">
                            {/* Profile Picture */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden relative">
                                    <Image
                                        src="/images/person1.png"
                                        alt="Marco"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            {/* Quote */}
                            <p className="text-lg text-black/70 mb-4 ">
                                &quot;Before this bootcamp, I had no IT background. After 5 weeks, I landed my first internship. Highly recommend!&quot;
                            </p>
                            {/* Name */}
                            <p className="text-xl font-bold text-black">Marco</p>
                        </div>

                        {/* Testimonial 2 - John */}
                        <div className="bg-gray-100 rounded-lg p-6 md:p-8 text-center">
                            {/* Profile Picture */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden relative">
                                    <Image
                                        src="/images/person2.png"
                                        alt="John"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            {/* Quote */}
                            <p className="text-lg text-black/70 mb-4">
                                &quot;Very practical and easy to understand. The instructor was amazing and helped me build confidence.&quot;
                            </p>
                            {/* Name */}
                            <p className="text-xl font-bold text-black">John</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <FAQSection />

            {/* Contact Form Section */}
            <ContactForm />
        </>
    );
}

