export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });
}
