import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1325",
          50: "#EAECF1",
          100: "#C7CCDB",
          200: "#9FA9C2",
          300: "#7686A9",
          400: "#4E6390",
          500: "#2C3F6C",
          600: "#1B2A4E",
          700: "#121D38",
          800: "#0B1325",
          900: "#060A15",
          950: "#03050A",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E7",
          100: "#F6EAC6",
          200: "#EDD88C",
          300: "#E4C653",
          400: "#DBBB3F",
          500: "#D4AF37",
          600: "#AC8C2C",
          700: "#846A21",
          800: "#5C4A17",
          900: "#34290D",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "navy-radial":
          "radial-gradient(ellipse at top, #1B2A4E 0%, #0B1325 55%, #060A15 100%)",
      },
      animation: {
        "pulse-live": "pulse-live 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
