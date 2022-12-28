const { join } = require("path");

module.exports = {
  content: [
    join(__dirname, "./src/client/components/**/*.{js,ts,jsx,tsx}"),
    join(__dirname, "./src/client/pages/**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
