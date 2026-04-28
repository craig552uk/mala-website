import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)

  // Date filters
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return new Date(dateObj).toISOString().split('T')[0]
  })

  // Pass through static assets unchanged
  eleventyConfig.addPassthroughCopy('src/assets')

  // Make all posts in src/posts/releases/ available as a collection
  eleventyConfig.addCollection('releases', (collectionApi) =>
    collectionApi
      .getFilteredByGlob('src/posts/releases/*.md')
      .sort((a, b) => b.date - a.date)
  )

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  }
}
