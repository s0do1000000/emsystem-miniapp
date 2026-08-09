import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./locales/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16130F",
        surface: "#1E1912",
        surface2: "#241E15",
        gold: "#C7A465",
        goldLight: "#E8D9B8",
        goldDeep: "#9C7C42",
        cream: "#F6F1E7",
        creamInk: "#221D16",
        line: "rgba(199,164,101,0.22)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.24em",
      },
      maxWidth: {
        app: "560px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        stroke: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
