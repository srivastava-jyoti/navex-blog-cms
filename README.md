# Navex Blog CMS

A small blog CMS: content is modelled and edited in **Sanity Studio**, and rendered as a static site by **Hugo**, deployed on **Netlify**.

> Full documentation (setup, architecture, trade-offs) is in progress.

## Repository layout

| Path       | Purpose                                                      |
| ---------- | ------------------------------------------------------------ |
| `studio/`  | Sanity Studio (TypeScript): schemas, validation, seed data   |
| `scripts/` | Build-time fetch: Sanity GROQ → Hugo Markdown + front matter |
| `web/`     | Hugo site: layouts, Sass, static assets                      |
| `video/`   | Walkthrough recording                                        |
