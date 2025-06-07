module.exports = async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });
};
