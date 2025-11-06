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
    aboutSection: {},
    sections: [],
};

// KV storage key
export const KV_KEY = 'landing:content';

