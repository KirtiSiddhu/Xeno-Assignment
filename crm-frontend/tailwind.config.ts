import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#1e1e2e",
        input: "#1e1e2e",
        ring: "#7c3aed",
        background: "#0a0a0f",
        foreground: "#f8fafc",
        primary: {
          DEFAULT: "#7c3aed",
          foreground: "#f8fafc",
        },
        secondary: {
          DEFAULT: "#06b6d4",
          foreground: "#0a0a0f",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#1e1e2e",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#1e1e2e",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "#111118",
          foreground: "#f8fafc",
        },
        card: {
          DEFAULT: "#111118",
          foreground: "#f8fafc",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
