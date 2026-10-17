# Navex Blog CMS

A small blog CMS. Editors create **blog posts, categories and authors** in **Sanity Studio**. A build-time script turns that content into Markdown, and **Hugo** renders it as a fast, accessible static site, hosted on **Netlify**.

- **Live site:** _to be added after the Netlify deploy_
- **Walkthrough video:** _to be added (`video/`)_

---

## Contents

1. [Quick start](#quick-start)
2. [Repository layout](#repository-layout)
3. [How it works](#how-it-works)
4. [Content model](#content-model)
5. [Front-end features](#front-end-features)
6. [Scripts](#scripts)
7. [Sample content](#sample-content)
8. [Deployment](#deployment)
9. [Trade-offs and decisions](#trade-offs-and-decisions)
10. [What I'd do next](#what-id-do-next)

---

## Quick start

### Prerequisites

| Tool              | Version                    | Check            |
| ----------------- | -------------------------- | ---------------- |
| Node.js           | 22.12 or newer (see `.nvmrc`) | `node -v`     |
| Hugo **extended** | 0.158 or newer (built with 0.168) | `hugo version` |
| Git               | any recent version         | `git --version`  |

Dart Sass does **not** need a separate install. It comes from the `sass-embedded` npm package (see [Trade-offs](#trade-offs-and-decisions)).

### Run the website

```bash
git clone https://github.com/srivastava-jyoti/navex-blog-cms.git
cd navex-blog-cms
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:1313. `npm run dev` fetches the latest published content from Sanity, then starts Hugo's dev server.

The Sanity dataset is **public-read**, so no API token is needed. `.env.example` already contains the real (public) project ID.

### Run Sanity Studio (optional, for editing content)

```bash
cd studio
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:3333 and sign in with a Sanity account that has access to the project.

---

## Repository layout

```
navex-blog-cms/
├── studio/                     Sanity Studio (TypeScript)
│   ├── schemaTypes/
│   │   ├── documents/          post.ts, category.ts, author.ts
│   │   └── objects/            blockContent.ts (rich text), accessibleImage.ts
│   ├── seed/                   sample content + NDJSON generator
│   ├── structure.ts            desk structure (Posts / Categories / Authors)
│   └── sanity.config.ts
├── scripts/
│   ├── fetch-sanity.ts         Sanity (GROQ) → Hugo Markdown files
│   ├── lib/portableText.ts     Portable Text → Markdown serializer (+ tests)
│   └── hugo.mjs                runs Hugo with Dart Sass on PATH
├── web/                        Hugo site
│   ├── hugo.toml
│   ├── layouts/                templates, partials, shortcodes, render hooks
│   ├── assets/scss/            Sass (abstracts / base / layout / components)
│   ├── assets/js/main.js       TOC highlighting, copy-link / share
│   └── content/                _index.md only; the rest is generated (git-ignored)
├── .env.example
└── package.json                fetch / dev / build / test scripts
```

---

## How it works

```
 Sanity Studio ──publish──▶ Sanity Content Lake
                                   │
                    npm run fetch  │  one GROQ query
                                   ▼
                     scripts/fetch-sanity.ts
                                   │  writes Markdown + JSON front matter
                                   ▼
        web/content/posts/<slug>.md
        web/content/authors/<slug>/_index.md
        web/content/categories/<slug>/_index.md
                                   │
                       hugo build  ▼
                       Static HTML / CSS / JS ──▶ Netlify
```

1. **One GROQ query** ([scripts/fetch-sanity.ts](scripts/fetch-sanity.ts)) fetches every post, author and category. References are resolved in the same query (`author->`, `category->`), as are image metadata (dimensions, blurred placeholder, hotspot). The client uses `perspective: 'published'`, so drafts never reach the site.
2. **The Portable Text body is converted to Markdown** ([scripts/lib/portableText.ts](scripts/lib/portableText.ts)). Because the body becomes real Markdown, Hugo's built-in `.TableOfContents`, `.ReadingTime` and heading anchors work with no extra code. Inline images become a `sanity-image` shortcode.
3. **Authors and categories are Hugo taxonomies.** Each post lists its author and category slugs in front matter. The script also writes an `_index.md` for every term holding its data (bio, image, description), so the author and category pages can show those details.
4. **Generated content is not committed.** `web/content/posts`, `authors` and `categories` are rebuilt from scratch on every fetch and are git-ignored. **Sanity is the single source of truth**: editing those files by hand has no lasting effect.

Hugo reads JSON front matter as well as YAML. I chose JSON for the generated files because titles, alt text or bios containing `:`, quotes or `#` can't break JSON the way they can break YAML.

---

## Content model

All schemas are in [studio/schemaTypes](studio/schemaTypes).

### Blog post (`post`)

| Field         | Type                  | Validation                                                    |
| ------------- | --------------------- | ------------------------------------------------------------- |
| `title`       | string                | required, 5–120 chars; warning above 70 (search results)      |
| `slug`        | slug (from title)     | required, unique                                              |
| `excerpt`     | text                  | required, 50–200 chars; also used as the meta description     |
| `heroImage`   | accessibleImage       | required, asset required                                      |
| `body`        | blockContent          | required, at least one block                                  |
| `publishedAt` | datetime              | required, defaults to now                                     |
| `category`    | reference → category  | required                                                      |
| `author`      | reference → author    | required                                                      |

### Category (`category`)

| Field         | Type   | Validation              |
| ------------- | ------ | ----------------------- |
| `title`       | string | required, 2–50 chars    |
| `slug`        | slug   | required                |
| `description` | text   | optional, max 300 chars |

### Author (`author`)

| Field   | Type            | Validation             |
| ------- | --------------- | ---------------------- |
| `name`  | string          | required, 2–80 chars   |
| `slug`  | slug            | required               |
| `bio`   | text            | required, 20–500 chars |
| `image` | accessibleImage | optional               |

### Shared types

- **`accessibleImage`**: an image with hotspot, plus `alt`, `decorative` and `caption`. Alt text is **required unless the editor marks the image as decorative**, in which case it renders with an empty `alt`. This makes accessible images the default instead of an afterthought.
- **`blockContent`**: rich text limited to H2–H4, quotes, bullet and numbered lists, bold, italic, code, strike-through, links (with URL validation) and inline images. H1 is deliberately not offered: the post title is the page's only `<h1>`.

### Editor experience

- Posts are split into **Content** and **Meta** tabs.
- List previews show the hero image, category and author ("Web Development · by Anika Rao").
- Posts can be sorted by publish date, newest first.
- The Vision tool is included for testing GROQ queries.

---

## Front-end features

### Pages

| Route                  | Template                         | Shows                                         |
| ---------------------- | -------------------------------- | --------------------------------------------- |
| `/`                    | `home.html`                      | featured latest post, category links, latest posts |
| `/posts/`              | `list.html`                      | all posts, paginated (9 per page)             |
| `/posts/<slug>/`       | `single.html`                    | the full post                                 |
| `/categories/`         | `taxonomy.html`                  | categories with description and post count    |
| `/categories/<slug>/`  | `term.html`                      | category description and its posts           |
| `/authors/`            | `taxonomy.html`                  | author cards                                  |
| `/authors/<slug>/`     | `term.html`                      | avatar, bio and the author's posts            |
| any unknown URL        | `404.html`                       | friendly not-found page                       |

### Blog post page

- Title, excerpt, publish date and **hero image** (responsive `srcset`, cropped around the editor's hotspot, blurred placeholder while loading).
- **Category** as a link in the header and again in the footer.
- **Author**: byline with avatar near the top, and an author card (bio plus a link to their posts) at the end.
- **Reading time**, e.g. "2 min read", from Hugo's word count (minimum 1 minute).
- **Table of contents** from H2–H4. On desktop it's a sticky sidebar that highlights the section you're reading. On mobile it collapses into a toggle.
- **Share**: a Copy link button (Clipboard API, with a fallback for browsers that block it), a native Share button where the Web Share API exists, plus LinkedIn, X and email links that work without JavaScript.
- **Heading anchors** (`#`) for linking straight to a section.
- **More in this category**: up to three related posts.

### Sass and HTML quality

- **Sass modules** with `@use`/`@forward`, compiled by Dart Sass through Hugo Pipes:
  `abstracts` (tokens, mixins) → `base` (reset, typography, utilities) → `layout` (container, header, footer) → `components`.
- **Mobile-first** layout, with breakpoints from a single `from($name)` mixin. Checked at 375 px (no horizontal scroll) and on desktop.
- **Light and dark themes** using CSS custom properties and `prefers-color-scheme`.
- **Accessibility:**
  - Semantic landmarks (`header`, `nav`, `main`, `article`, `aside`, `footer`) and a skip link.
  - One `<h1>` per page, with headings in order.
  - `alt` on every image; author avatars use empty `alt` because the name sits next to them.
  - Visible `:focus-visible` rings and `aria-current` in the navigation.
  - Copy-link feedback announced to screen readers through `role="status"`.
  - Animations respect `prefers-reduced-motion`.
- **Progressive enhancement:** without JavaScript, the TOC stays expanded and the share links still work.

### Handling missing fields

Sanity validation stops editors publishing incomplete posts, but the build doesn't rely on it (for example, documents created through the API skip Studio validation):

- **Fetch script:**
  - Skips posts with no title or slug, and authors or categories with no name, title or slug, logging a warning for each.
  - If a post has no publish date, it falls back to the last-updated time.
  - Reports unsupported rich-text blocks instead of failing.
- **Templates:**
  - Every optional value is wrapped in `with`, so a post with no hero image, author or category still renders.
  - An author with no image gets an initials avatar.
  - A category with no description renders without one.
  - Empty lists show an "empty state" message.
- **Sample data covers this on purpose:** one author has no image and one category has no description.

---

## Scripts

Run from the repository root:

| Command             | What it does                                                      |
| ------------------- | ----------------------------------------------------------------- |
| `npm run dev`       | fetch content, then start Hugo's dev server on :1313              |
| `npm run build`     | fetch content, then build the production site into `web/public/`  |
| `npm run fetch`     | fetch content from Sanity into `web/content/` only               |
| `npm run hugo -- …` | run Hugo (with Dart Sass) with any arguments                      |
| `npm test`          | unit tests for the Portable Text → Markdown serializer            |
| `npm run typecheck` | type-check the fetch scripts                                      |
| `npm run studio`    | start Sanity Studio (after `npm ci` inside `studio/`)             |

Run from `studio/`:

| Command               | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | start the Studio on :3333                                 |
| `npm run typecheck`   | type-check schemas and config                             |
| `npm run seed:build`  | regenerate `seed/seed.ndjson` from `seed/content.mjs`     |
| `npm run seed:import` | **replace** the `production` dataset with the seed data   |
| `npm run deploy`      | deploy the Studio to `*.sanity.studio`                    |

### Environment variables

| Variable                   | Used by      | Default        |
| -------------------------- | ------------ | -------------- |
| `SANITY_PROJECT_ID`        | fetch script | required       |
| `SANITY_DATASET`           | fetch script | `production`   |
| `SANITY_API_VERSION`       | fetch script | `2025-10-01`   |
| `SANITY_STUDIO_PROJECT_ID` | Studio       | required       |
| `SANITY_STUDIO_DATASET`    | Studio       | `production`   |

---

## Sample content

The dataset holds **6 blog posts, 4 categories and 3 authors** (all people are fictional). Every post links to a category and an author, and categories hold 1–2 posts each, so the listing pages have real content.

Sample content is kept as readable source in [studio/seed/content.mjs](studio/seed/content.mjs), written in a tiny Markdown-like syntax. [build-seed.mjs](studio/seed/build-seed.mjs) compiles it into Portable Text NDJSON. To load it into your own Sanity project:

```bash
cd studio
npm run seed:build
npm run seed:import
```

`seed:import` uses `--replace`, so it overwrites documents with the same IDs. Images are placeholder photos from picsum.photos (Unsplash); Sanity downloads them during import.

---

## Deployment

The site will be hosted on Netlify. The setup:

- **Build command:** `npm run build`
- **Publish directory:** `web/public`
- **Environment variables:** `SANITY_PROJECT_ID`, `SANITY_DATASET`, plus `NODE_VERSION` and `HUGO_VERSION` pinned to match local versions.
- **Rebuild on publish:** a Sanity webhook calls a Netlify build hook, so publishing in the Studio redeploys the site within about a minute.

_The live URL will be added here once deployed._

---

## Trade-offs and decisions

**A build-time fetch script instead of Hugo content adapters.**
Hugo can pull remote data itself (`_content.gotmpl` + `resources.GetRemote`), which would avoid the Node step. But rendering Portable Text inside Go templates is awkward, and Hugo's native table of contents and reading time only work on Markdown content. Converting to Markdown first keeps the templates simple and uses Hugo the way it's designed. The cost is one extra build step and a Node dependency.

**A custom Portable Text → Markdown serializer.**
The schema allows only a small, fixed set of styles, so a ~190-line serializer with unit tests is easier to trust, explain and adjust than adding a third-party dependency. It handles nested and adjacent marks, whitespace around delimiters, Markdown escaping, and nested lists.

**Static build, not live content.**
Content changes need a rebuild, triggered by a webhook. In return the site is fast, cheap to host, and stays up even if Sanity's API has an outage. For a blog, a delay of about a minute after publishing is acceptable.

**Dart Sass from npm.**
Hugo's built-in LibSass is deprecated and doesn't support the modern `@use` module system. Dart Sass normally has to be installed separately on every machine and on Netlify. Instead, the `sass-embedded` npm package ships the native Dart Sass binary, and [scripts/hugo.mjs](scripts/hugo.mjs) puts it on `PATH` before running Hugo. Local and CI builds therefore use the same Sass version with nothing extra to install.

**Images from Sanity's CDN instead of Hugo image processing.**
Sanity's image API already resizes, crops (respecting the editor's hotspot) and converts formats (WebP or AVIF through `auto=format`) on request. Downloading every image into Hugo just to resize it again would slow builds for no benefit.

**Public dataset, no token.**
The blog content is public anyway, and this lets a fresh clone build with nothing but the public project ID. A private dataset would need a read token in `.env` and in Netlify's environment variables.

**JSON front matter** for generated files, for the escaping reasons described under [How it works](#how-it-works).

---

## What I'd do next

- **Editable site settings.** The site title, tagline and navigation are currently in `hugo.toml` and the templates. A Sanity "Site settings" document would let editors change them.
- **UI text in one place.** Interface labels ("On this page", "Share this post"…) would move to Hugo's `i18n/` files, which also makes translation possible.
- **Draft previews,** using Sanity's Presentation tool or a preview deploy.
- **Search,** for example Pagefind, which indexes the built HTML at build time.
- **Structured data** (`Article` JSON-LD) and a `<link>` to the RSS feed in the page head. Hugo already generates `sitemap.xml` and `index.xml` (RSS); they just aren't linked or customised yet.
- **Automated checks:** accessibility (axe), Lighthouse and the unit tests running in CI on every pull request.
