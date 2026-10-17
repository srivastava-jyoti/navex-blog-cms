# Navex Blog CMS

A simple blog CMS. Editors create **blog posts, categories and authors** in **Sanity Studio**, and **Hugo** renders them as a static website.

- **Live site:** [https://capable-strudel-e37216.netlify.app/](https://capable-strudel-e37216.netlify.app/)
- **Walkthrough video:** _coming soon (`video/`)_

## Tech stack

| Part      | Technology                         |
| --------- | ---------------------------------- |
| CMS       | Sanity Studio (TypeScript)         |
| Website   | Hugo (extended), Sass (Dart Sass)  |
| Hosting   | Netlify                            |

## Getting started

**Requirements:** Node.js 22.12+ and Hugo extended 0.158+.

### Run the website

```bash
git clone https://github.com/srivastava-jyoti/navex-blog-cms.git
cd navex-blog-cms
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:1313

The Sanity dataset is public, so no API token is needed. `.env.example` already contains the project ID.

### Run Sanity Studio

```bash
cd studio
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:3333 and sign in with a Sanity account that has access to the project.

## Scripts

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Fetch content from Sanity and start the Hugo server   |
| `npm run build`   | Fetch content and build the site into `web/public/`   |
| `npm run fetch`   | Fetch content from Sanity only                        |
| `npm test`        | Run the unit tests                                    |
| `npm run studio`  | Start Sanity Studio                                   |

## Project structure

```
studio/                 Sanity Studio
  schemaTypes/
    documents/          post, category, author
    objects/            rich-text body, image with alt text (shared)
  seed/seed.ndjson      sample content
scripts/
  fetch-sanity.ts       fetches content from Sanity and writes Markdown for Hugo
  lib/portableText.ts   converts Sanity rich text to Markdown (with tests)
  hugo.mjs              runs Hugo with Dart Sass
web/                    Hugo site
  layouts/              page templates and partials
  assets/scss/          Sass styles
  assets/js/main.js     copy-link button
netlify.toml            Netlify build settings
```

## How it works

1. Editors create and publish content in Sanity Studio.
2. `npm run fetch` runs one GROQ query that returns all published posts, authors and categories. It saves them as Markdown files in `web/content/`.
3. Hugo builds the website from those files.

The files in `web/content/` are generated on every build and are **not committed**. Sanity is the single source of truth.

## Deployment

The site is hosted on Netlify and deploys automatically on every push to `main`. Build settings are in [`netlify.toml`](netlify.toml):

- **Build command:** `npm run build`, which fetches content from Sanity and then builds the site with Hugo
- **Publish directory:** `web/public`
- **Pinned versions:** Node 22 and Hugo 0.168.0

The Sanity settings are not stored in the repo. Set them in Netlify under **Site configuration → Environment variables**:

| Variable            | Value        |
| ------------------- | ------------ |
| `SANITY_PROJECT_ID` | `9l9uv974`   |
| `SANITY_DATASET`    | `production` |

## Content model

| Type     | Fields                                                                                   |
| -------- | ---------------------------------------------------------------------------------------- |
| Post     | title, slug, excerpt, body (rich text), publish date, hero image, category, author       |
| Category | title, slug, description (optional)                                                      |
| Author   | name, slug, bio, profile image (optional)                                                |

**Validation:**
- Required fields and length limits (for example, the excerpt is 50–200 characters).
- Unique slugs.
- Required category and author references.
- Alt text required on every uploaded image.

## Features

**Blog post page**
- Title, publish date, hero image and content
- Category and author shown on the post, linking to their pages
- Reading time (e.g. "2 min read")
- Copy-link button
- Table of contents ("In this article"), sticky on desktop
- "You might like": related posts, same category first

**Other pages**
- Home page and an all-posts page
- Category and author listing pages, plus a page for each category and author (Hugo taxonomies)
- A 404 page

**Quality**
- Sass styles, mobile-first, for mobile and desktop
- Semantic HTML: landmarks, one `<h1>` per page, correct heading order, alt text, visible keyboard focus
- Handles missing data: posts without a title or slug are skipped at build time, and pages still render when optional fields (hero image, category, author photo) are missing

## Trade-offs

- **Content is fetched at build time.** The site is static, so it's fast and stays up even if Sanity is down. In return, publishing in Sanity needs a rebuild (on Netlify, a Sanity webhook can trigger this).
- **Rich text is converted to Markdown.** Hugo's built-in reading time and table of contents then work without extra code. The cost is a small custom converter, which has its own unit tests.
- **Images are served from Sanity's CDN.** Sanity resizes and crops them (respecting the editor's focal point), so Hugo doesn't need to process images.
- **The dataset is public.** No API token is needed, so a fresh clone builds straight away.
- **Dart Sass comes from npm** (`sass-embedded`). Local and Netlify builds use the same Sass version with nothing extra to install.

## Sample content

The repo includes **6 posts, 4 categories and 3 authors**. Every post is linked to a category and an author. To load them into your own Sanity project:

```bash
cd studio
npm run seed:import
```

This replaces any documents with the same IDs in the `production` dataset.
