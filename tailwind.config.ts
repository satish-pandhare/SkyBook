import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette — dark airline theme
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd4ff",
          300: "#8ebafe",
          400: "#5996fb",
          500: "#3371f7",
          600: "#1d52ec",
          700: "#153fd9",
          800: "#1834b0",
          900: "#19308a",
          950: "#141f54",
        },
        // Dark surface colors
        surface: {
          DEFAULT: "#0a0e1a",
          50: "#f0f2f7",
          100: "#d9dce8",
          200: "#b3b9d1",
          300: "#8d96ba",
          400: "#6773a3",
          500: "#49547e",
          600: "#3a4365",
          700: "#2b324c",
          800: "#1a1f33",
          900: "#0f1320",
          950: "#0a0e1a",
        },
        // Accent for CTAs and highlights
        accent: {
          DEFAULT: "#06d6a0",
          50: "#ecfdf6",
          100: "#d1fae8",
          200: "#a7f3d5",
          300: "#6ee7bc",
          400: "#34d39e",
          500: "#06d6a0",
          600: "#00a87c",
          700: "#008766",
          800: "#036b52",
          900: "#045844",
          950: "#013128",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, #0a0e1a 0%, #141f54 50%, #1d52ec 100%)",
        "card-gradient":
          "linear-gradient(180deg, rgba(26, 31, 51, 0.8) 0%, rgba(15, 19, 32, 0.95) 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(51, 113, 247, 0.3)",
        "glow-accent": "0 0 20px rgba(6, 214, 160, 0.3)",
        "card": "0 4px 30px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.4)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
