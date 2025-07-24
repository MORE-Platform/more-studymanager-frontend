import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    import('@tailwindcss/forms'),
    import('@tailwindcss/typography'),
    import('@tailwindcss/aspect-ratio'),
  ],
};
