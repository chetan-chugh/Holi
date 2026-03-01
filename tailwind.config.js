/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        baloo: ['"Baloo 2"', "cursive"],
        poppins: ["Poppins", "sans-serif"],
      },
      keyframes: {
        splat: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.9" },
        },
        droplet: {
          "0%": { transform: "translate(0,0) scale(1)", opacity: "1" },
          "100%": {
            transform: "translate(var(--tx), var(--ty)) scale(0)",
            opacity: "0",
          },
        },
        ring: {
          "0%": { transform: "scale(0.5)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        float: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "10%": { opacity: "0.4" },
          "90%": { opacity: "0.4" },
          "100%": { transform: "translateY(-100vh)", opacity: "0" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        splat: "splat 0.3s ease-out forwards",
        droplet: "droplet 0.5s ease-out forwards",
        ring: "ring 0.5s ease-out forwards",
        bounce: "bounce 1.5s ease-in-out infinite",
        float: "float 6s linear infinite",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};