// Default content structure for the landing page
export const defaultContent = {
    header: {
        logo: {
            image: "/images/logo.png", // Path for public folder images (starts with /)
            text: "ITJobNow", // Fallback text if no image
            link: "/", // Logo link
        },
        menu: [
            {
                label: "Courses",
                link: "#courses",
            },
            {
                label: "About",
                link: "#about",
            },
            {
                label: "Contact",
                link: "/contact",
            },
            // {
            //     label: "Admin",
            //     link: "/admin",
            //     className: "text-slate-500", // Optional styling
            // },
        ],
        button: {
            text: "Enroll Now",
            link: "/enroll",
            className: "bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors",
        },
    },
    hero: {
        title: "Launch Your Tech Career in 5 Weeks.",
        subtitle: "Add real content from /admin",
        ctaText: "Reserve Your Seat",
        ctaLink: "#",
        backgroundImage: "",
        backgroundVideo: "", // Video URL from Blob
        badge: "⚡ Limited seats for next cohort!",
    },
    aboutSection: {},
    faq: {
        title: "Frequently Asked Questions",
        description:
            "Explore our FAQs to learn more about how we work, what we offer, and how we can help you.",
        initialOpenCount: 3,
        items: [
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
                answer:
                    "Yes, upon successful completion of the bootcamp, you will receive a certificate of completion.",
            },
            {
                question: "Can I pay in installments?",
                answer:
                    "Yes, we offer flexible payment plans. Please contact us for more details.",
            },
        ],
    },
    sections: [],
};

// Empty content structure (for admin page when creating new content)
export const emptyContent = {
    header: {
        logo: {
            image: "",
            text: "ITJobNow",
            link: "/",
        },
        menu: [
            {
                label: "",
                link: "",
            },
        ],
        button: {
            text: "",
            link: "",
            className: "",
        },
    },
    hero: {
        title: "",
        subtitle: "",
        ctaText: "",
        ctaLink: "",
        backgroundImage: "",
        backgroundVideo: "",
        badge: "",
    },
    faq: {
        title: "",
        description: "",
        initialOpenCount: 3,
        items: [
            {
                question: "",
                answer: "",
            },
        ],
    },
    aboutSection: {},
    sections: [],
};

// KV storage key
export const KV_KEY = 'landing:content';

