/** @type {import('tailwindcss').Config} */
let config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            p: {
              marginTop: "0",
              marginBottom: "0",
            },
          },
        },
      },
    },
  },
};

export default config;
