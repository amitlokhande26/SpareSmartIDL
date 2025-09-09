/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // ✅ Scans everything inside src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
