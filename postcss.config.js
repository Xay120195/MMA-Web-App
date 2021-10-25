const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./public/**/*.html", "./src/**/*.js"],
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
});

const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssImport = require("postcss-import");
const postcssNested = require("postcss-nested");

module.exports = {
  plugins: [
    postcssImport(),
    tailwindcss("tailwind.js"),
    autoprefixer(),
    postcssNested(),
    ...(process.env.NODE_ENV === "production" ? [purgecss] : []),
  ],
};
