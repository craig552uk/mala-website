# mala-website

The marketing and download website for [Mala Editor](https://github.com/craig552uk/mala-editor).

Built with [11ty v3](https://www.11ty.dev/), plain CSS, hosted on GitHub Pages.

## Development

```bash
npm install
npm run dev       # start local dev server at http://localhost:8080
npm run build     # build to _site/
```

## How releases are published

When a new version of Mala Editor is tagged and released:

1. The `mala-editor` CI runs `release.yml`, which dispatches a `mala-release` event to this repo via `repository_dispatch`.
2. `.github/workflows/on-release.yml` in this repo receives the event and:
   - Creates a new post in `src/posts/releases/` with frontmatter and changelog content.
   - Updates `src/_data/site.js` to point to the new latest version.
   - Replaces `src/pages/changelog.md` content with the full CHANGELOG.
   - Commits and pushes to `main`.
3. The push triggers `deploy.yml`, which builds and deploys the updated site to GitHub Pages.

## Structure

```
.eleventy.js          — 11ty config (plugins, filters, collections)
src/
  _data/site.js       — global site metadata + latest version
  _includes/
    layouts/
      base.njk        — HTML shell, nav, footer
      page.njk        — generic content page
      release.njk     — release post (download buttons + notes)
  assets/
    css/style.css     — One Dark Pro design tokens + all styles
  pages/
    index.njk         — home page with download buttons
    blog.njk          — list of all release posts
    changelog.md      — full CHANGELOG (replaced on each release)
  posts/
    releases/         — one .md file per release
.github/
  workflows/
    deploy.yml        — build + deploy to GitHub Pages on push to main
    on-release.yml    — handle repository_dispatch from mala-editor
```
