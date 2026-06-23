import MarkdownIt from "markdown-it";
import fs from "fs";
import path from "path";

export default async function (eleventyConfig) {
  const md = new MarkdownIt({
    html: true,
  });

  eleventyConfig.addNunjucksShortcode("markdownFile", (filePath) => {
    const fullPath = path.join("_includes", filePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return md.render(content);
  });

  eleventyConfig.addPassthroughCopy({ public: "/" });
}
