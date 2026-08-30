/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ink navy — base dark, text, primary surfaces
        ink: {
          50: "#F4F5F7",
          100: "#E7E9ED",
          200: "#C7CBD6",
          300: "#9CA3B5",
          400: "#6B7390",
          500: "#4B5270",
          600: "#363C56",
          700: "#262B41",
          800: "#1B2135",
          900: "#141B2E",
          950: "#0D1220",
        },
        // Dawn amber — hero accent
        dawn: {
          50: "#FDF6EC",
          100: "#FBEAD1",
          200: "#F5D19E",
          300: "#EFB86C",
          400: "#E9A653",
          500: "#E29B3D",
          600: "#C67F27",
          700: "#9C631E",
          800: "#734818",
          900: "#4D3110",
        },
        // Sky blue — secondary
        sky: {
          50: "#EEF2F7",
          100: "#D6E0EC",
          200: "#AFC2DA",
          300: "#87A4C7",
          400: "#688DB8",
          500: "#4A6FA5",
          600: "#3B5985",
          700: "#2D4465",
          800: "#1F2F47",
          900: "#141E2E",
        },
        // Clay red — alerts / destructive only
        clay: {
          50: "#FBEEEC",
          100: "#F4D2CC",
          200: "#E7A99C",
          300: "#D77F6C",
          400: "#C6604A",
          500: "#B8493D",
          600: "#993B31",
          700: "#7A2E27",
          800: "#5B221D",
          900: "#3D1613",
        },
        // Cool pale background — not cream
        paper: "#F3F5F8",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        13: "3.25rem",
      },
      borderRadius: {
        md: "0.5rem",
      },
    },
  },
  plugins: [],
};
