/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        'fastapi': '#009485',
        'fastapi-light': '#30b2a1',
        'svelte': '#FF3E00',
        'svelte-light': '#ff6e42',
        'numpy': '#46b8ffff',
        'javascript': "#F1E05A"
      }
    },
  },
  plugins: [
  ],
}