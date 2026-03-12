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
        flatline: {
          red: "#FF2D55",
          dark: "#080810",
          deeper: "#04040A",
          card: "#0E0E1A",
          border: "#1C1C2E",
          muted: "#5C5C7A",
          subtle: "#1A1A2E",
        },
      },
      backgroundImage: {
        "glow-conic": "conic-gradient(from 180deg at 50% 50%, #FF2D55 0deg, #7928CA 180deg, #FF2D55 360deg)",
        "hero-gradient": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(121, 40, 202, 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255, 45, 85, 0.12), transparent)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
      },
      boxShadow: {
        "glow-red": "0 0 30px rgba(255, 45, 85, 0.2)",
        "glow-purple": "0 0 40px rgba(121, 40, 202, 0.15)",
        "card": "0 1px 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
