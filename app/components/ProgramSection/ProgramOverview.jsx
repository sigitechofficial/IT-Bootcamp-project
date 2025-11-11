"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import {
  FaGlobe,
  FaGraduationCap,
  FaUsers,
  FaYoutube,
  FaChevronRight,
  FaClock,
  FaCalendarAlt,
  FaUserTie,
} from "react-icons/fa";
import FAQSection from "./FAQ";
import ContactForm from "./ContactForm";
import { defaultContent } from "@/lib/constants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";

export default function ProgramOverview({ faq, programOverview }) {
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
  const testimonials = [
    {
      name: "Marco",
      quote:
        "“Before this bootcamp, I had no IT background. After 5 weeks, I landed my first internship. Highly recommend!”",
      img: "/images/person1.png",
      alt: "Marco",
    },
    {
      name: "John",
      quote:
        "“Very practical and easy to understand. The instructor was amazing and helped me build confidence.”",
      img: "/images/person2.png",
      alt: "John",
    },
    // add more if you like
  ];

  const handleSelectCycle = (cycleId) => {
    setSelectedCycle(cycleId);
    router.push(`/payment?cycle=${cycleId}`);
  };

  const faqItemsCount = Array.isArray(faq?.items) ? faq.items.length : 0;
  const faqInitialOpenCount =
    typeof faq?.initialOpenCount === "number" ? faq.initialOpenCount : 0;
  const faqKey = `${faqItemsCount}-${faqInitialOpenCount}`;
  const po = programOverview || defaultContent.programOverview;
  const title = po?.title || defaultContent.programOverview.title;
  const subtitle = po?.subtitle || defaultContent.programOverview.subtitle;
  const whatYouLearn =
    Array.isArray(po?.whatYouLearn) && po.whatYouLearn.length > 0
      ? po.whatYouLearn
      : defaultContent.programOverview.whatYouLearn;
  const benefits =
    Array.isArray(po?.benefits) && po.benefits.length > 0
      ? po.benefits
      : defaultContent.programOverview.benefits;
  const outcomes =
    Array.isArray(po?.outcomes) && po.outcomes.length > 0
      ? po.outcomes
      : defaultContent.programOverview.outcomes;

  return (
    <>
      <section className="py-16 px-4 bg-[#F6F9FC]">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-center mb-6 text-black font-switzer">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-center text-black max-w-2xl px-5 mx-auto mb-12">
            {subtitle}
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
                    <IoIosCheckmarkCircleOutline
                      size={24}
                      color="#0E9013"
                      opacity={0.5}
                    />
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
                    <IoIosCheckmarkCircleOutline
                      size={24}
                      color="#0E9013"
                      opacity={0.5}
                    />
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
                    <IoIosCheckmarkCircleOutline
                      size={24}
                      color="#0E9013"
                      opacity={0.5}
                    />
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
        <div className="max-w-[1179px] mx-auto">
          {/* Main Title */}
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-center mb-12 text-black font-switzer">
            Course Details, Duration & Pricing
          </h2>

          {/* Content Grid */}
          <div className="flex flex-col gap-8 lg:gap-12  mx-auto ">
            {/* Left: Course Details */}
            <div className="space-x-6 flex justify-between ">
              <div className="bg-white rounded-lg p-4 flex-1 shadow-sm shadow-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <FaClock className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    Duration
                  </h3>
                  <p className="text-lg text-black/70">5 week Intensive</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 flex-1 shadow-sm shadow-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    Schedule
                  </h3>
                  <p className="text-lg text-black/70">
                    Full-Time: <br /> Mon-Fri, 9am - 5pm
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 flex-1 shadow-sm shadow-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">
                    Duration
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-lg text-black/70">October 28, 2025</li>
                    <li className="text-lg text-black/70">January 6, 2026</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bootcamp Cycle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto w-full mb-8">
              {bootcampCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="relative bg-gray-100 rounded-lg p-6 md:p-8"
                >
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
                    className={`w-full py-3 rounded-lg font-semibold mb-6 transition-colors ${
                      selectedCycle === cycle.id
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
                Our &apos;Learn-by-doing&apos; approach means you&apos;ll spend
                over 80% of your time on practice, hand-on coding projects that
                simulate real-world job task.
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
                Our &apos;Learn-by-doing&apos; approach means you&apos;ll spend
                over 80% of your time on practice, hand-on coding projects that
                simulate real-world job task.
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
                Our &apos;Learn-by-doing&apos; approach means you&apos;ll spend
                over 80% of your time on practice, hand-on coding projects that
                simulate real-world job task.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Card Section */}
      <section className="py-16 px-4 bg-[#F6F9FC]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side: Text Content with CTA */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <FaYoutube className="text-red-600 text-4xl md:text-5xl" />
                <h3 className="text-2xl md:text-3xl font-bold text-black">
                  Not sure if this is for you?
                </h3>
              </div>
              <p className="text-base md:text-lg text-black/70 mb-6">
                Watch Our YouTube channel to see if this course is right for
                you. Get a preview of our teaching style, student success
                stories, and what you&apos;ll learn in this intensive bootcamp.
              </p>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-fit"
              >
                Watch on YouTube
                <FaChevronRight className="text-sm" />
              </a>
            </div>

            {/* Right Side: Embedded Video */}
            <div className="w-full">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-12 items-start">
            <div className="flex flex-col items-center lg:items-start  col-span-1">
              {/* Photo Placeholder */}
              <div className="w-full max-w-[300px] aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-400 text-lg">Photo</span>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <FaUserTie className="text-white text-xs" />
                </div>
                <span className="text-black font-semibold text-sm">
                  Lead Instructor
                </span>
              </div>
            </div>

            <div className="flex flex-col col-span-3">
              {/* Section Title */}
              <h2 className="text-primary text-sm font-bold uppercase tracking-wider mb-2">
                YOUR INSTRUCTOR
              </h2>

              {/* Instructor Name */}
              <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                [Instructor Name]
              </h3>

              {/* Description */}
              <p className="text-lg text-black/70 mb-6">
                10+ years in real IT support, on-call, and onsite
                troubleshooting. Hired and trained junior techs. Knows exactly
                what managers listen for in interviews — because they were that
                manager.
              </p>

              {/* Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Background Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-black mb-2">
                    Background
                  </h4>
                  <p className="text-black/70">
                    Helpdesk lead, field technician, escalation engineer
                  </p>
                </div>

                {/* Focus Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-black mb-2">Focus</h4>
                  <p className="text-black/70">
                    Making beginners production-ready fast
                  </p>
                </div>

                {/* Teaching Style Card */}
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <h4 className="text-lg font-bold text-black mb-2">
                    Teaching style
                  </h4>
                  <p className="text-black/70">
                    No ego, no jargon. We demo, you do, we correct, you repeat
                    until it&apos;s instinct.
                  </p>
                </div>
              </div>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-3">
                <span className="bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium">
                  Hiring experience
                </span>
                <span className="bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium">
                  Real-world tickets
                </span>
                <span className="bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium">
                  Interview prep
                </span>
              </div>
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
              Your future in tech start here. Reserve your seat for the next
              cohort.
            </p>
            <button className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Reserve Your Seat
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto">
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
                &quot;Before this bootcamp, I had no IT background. After 5
                weeks, I landed my first internship. Highly recommend!&quot;
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
                &quot;Very practical and easy to understand. The instructor was
                amazing and helped me build confidence.&quot;
              </p>
              {/* Name */}
              <p className="text-xl font-bold text-black">John</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection key={faqKey} faq={faq} />

      {/* Contact Form Section */}
      <ContactForm />
    </>
  );
}
