/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,md,ts}"],
  theme: {
    // Locked palette: only these colours exist, any other colour class generates nothing.
    colors: {
      'transparent': 'transparent',
      'current': 'currentColor',
      'black': '#000',
      'white': '#fff',
      'gray': { 400: '#9ca3af' },
      'yellow': { 50: '#fefce8', 200: '#fef08a' },
      'purple': { 400: '#c084fc' },
      'blue': { 200: '#bfdbfe', 300: '#93c5fd' },
      'fastapi': '#009485',
      'fastapi-light': '#30b2a1',
      'svelte': '#FF3E00',
      'svelte-light': '#ff6e42',
      'numpy': '#46b8ffff',
      'javascript': "#F1E05A"
    },
    extend: {
      // Default border colour was Tailwind's gray-200, keep it.
      borderColor: {
        DEFAULT: '#e5e7eb'
      }
    },
  },
  plugins: [
  ],
}
