// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    animation: {
      "bg-color-transition": "bg-color-transition 2s ease infinite",
      border: "border 1.5s cubic-bezier(0.5,0.7,0.6,0.4) forwards ",
    },
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "bg-color-transition": {
          "0%": { background: "linear-gradient(to left, #2D3748, #2D3748)" },
          "50%": { background: "linear-gradient(to left, #2D3748, #48BB78)" },
          "100%": { background: "linear-gradient(to left, #48BB78, #48BB78)" },
        },
        border: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "50% 50%" },
          "100%": { backgroundPosition: "100% 35%" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
