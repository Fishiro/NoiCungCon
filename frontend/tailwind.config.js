/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#0284C7",
                accent: "#F97316",
                dark: "#1E293B",
                muted: "#64748B",
                surface: "#FFFFFF",
            },
            fontSize: {
                body: "14px",
                sub: "24px",
                title: "40px",
            },
            spacing: {
                base: "14px",
                md: "22px",
                lg: "36px",
                xl: "58px",
            },
            fontFamily: {
                // Thay thế font Inter cũ bằng Google Sans Flex làm font mặc định
                sans: ['"Google Sans Flex"', "sans-serif"],
            },
        },
    },
    plugins: [],
};
