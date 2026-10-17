# Navex Blog CMS

A simple blog: content is managed in **Sanity Studio** and rendered by **Hugo**.

- **Live site:** _coming soon_
- **Walkthrough video:** _coming soon_

## Tech stack

- Sanity Studio (TypeScript): blog posts, categories, authors
- Hugo: static site, styled with Sass
- Netlify: hosting

## Getting started

You need **Node.js 22+** and **Hugo extended 0.158+**.

**Run the website**

```bash
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:1313

**Run Sanity Studio**

```bash
cd studio
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:3333

## Project structure

```
studio/    Sanity Studio: schemas and sample content
scripts/   Fetches content from Sanity and converts it for Hugo
web/       Hugo site: templates, Sass and JavaScript
```

## How it works

1. Editors create posts, categories and authors in Sanity Studio.
2. `npm run fetch` fetches the published content from Sanity and saves it as Markdown files in `web/content/`. These files are generated on every build and are not committed.
3. Hugo builds the site from those files.

## Features

- Blog post page with title, publish date, hero image and content
- Author and category shown on each post, linking to their pages
- Category and author listing pages (Hugo taxonomies)
- Reading time, a table of contents ("In this article", sticky on desktop) and a copy-link button
- Full-width hero with the title beside the image
- "You might like" section with related posts (same category first)
- Responsive layout for mobile and desktop, styled with Sass
- Semantic HTML and accessibility basics (alt text, heading order, keyboard focus)
- Validation in Sanity, and pages still render when optional fields are missing

## Trade-offs

- **Content is fetched at build time.** Pages are static, so they're fast, but publishing in Sanity needs a rebuild (triggered automatically by a webhook).
- **Rich text is converted to Markdown.** This lets Hugo's built-in reading time and heading IDs work without extra code.
- **The Sanity dataset is public.** No API token is needed, so a fresh clone works straight away.
- **Images are served from Sanity's CDN.** Sanity resizes and crops them, so Hugo doesn't process images.

## Sample content

The repo includes 6 sample posts, 4 categories and 3 authors in `studio/seed/seed.ndjson`. To load them into a Sanity project:

```bash
cd studio
npm run seed:import
```
