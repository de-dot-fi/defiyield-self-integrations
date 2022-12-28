import { join } from "path";

module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: { config: join(__dirname, "tailwind.config.js") },
    autoprefixer: {},
  },
};
