# AI usage

This project was built with the help of an AI coding assistant. This file records which tool was used, what it did, what I did, and how the output was checked.

## Tool

- **Claude Code** (Anthropic), running the **Claude Opus 5.5** model, inside the Claude desktop app.
- It worked directly in this repository: it read and wrote files, ran terminal commands (npm, Hugo, the Sanity CLI, git), and checked pages in a built-in browser.

## What the AI did

| Area | AI contribution |
| --- | --- |
| Planning | Read the assignment brief and proposed the architecture: Sanity → build-time fetch script → Markdown → Hugo, taxonomies for authors and categories, and Netlify with a rebuild webhook. Suggested a 3-day plan. |
| Sanity Studio | Wrote the TypeScript schemas (post, category, author, rich-text body, image with alt text), the validation rules, the desk structure and the Studio config. |
| Sample content | Wrote the 6 sample posts, 4 categories and 3 fictional authors, plus the script that turns them into Sanity's import format. Looked at each placeholder photo and corrected alt text that didn't match it. |
| Fetch script | Wrote `scripts/fetch-sanity.ts` (GROQ query, file generation, handling of missing fields) and the Portable Text → Markdown serializer, with 9 unit tests. |
| Hugo front end | Wrote every template, partial and shortcode, the heading render hook, the Sass architecture and styles, and `main.js` (TOC highlighting, copy-link / share). |
| Tooling | Set up Dart Sass through the `sass-embedded` npm package and the `scripts/hugo.mjs` launcher. |
| Debugging | Found and fixed bugs during browser testing: the TOC highlighted the wrong section (a doubled scroll offset), and copy-link failed where the Clipboard API is blocked (added a fallback). Also caught and repaired a script edit of its own that had duplicated part of `main.js`. |
| Documentation | Drafted `README.md` and this file. |

## What I did

- Provided the assignment and set the goal and priorities.
- Installed the toolchain (Hugo extended) and signed in to Sanity.
- Created the Sanity organisation and project, and gave the AI the project ID.
- Directed the work step by step: approved the plan, asked for the design and post-page features, and asked for unused files to be removed.
- Reviewed the approach by questioning it, for example: what is hardcoded, where the GROQ query lives, and why fetched content appears as files in `web/content/`. That led to clearer documentation and a list of improvements (see "What I'd do next" in the README).
- Took ownership of version control. After the first commits I told the AI to stop committing so I could review the changes and commit them myself. Commits created with the AI's help carry a `Co-Authored-By: Claude` trailer.
- Decided what goes into the final submission.

## How the output was checked

- **Type checks:** `npm run typecheck` (fetch scripts) and `npm run typecheck` in `studio/`.
- **Schema validation:** `sanity schema validate`, with 0 errors and 0 warnings.
- **Unit tests:** `npm test`, 9/9 passing for the serializer.
- **End-to-end build:** imported the seed data into Sanity, then ran `npm run build` (fetch, then Hugo) from scratch, with no warnings.
- **Browser checks:** home, post, author and category pages at desktop and mobile (375 px) widths, in light and dark themes, plus:
  - No horizontal scrolling on mobile.
  - Heading order and alt text on every image.
  - The TOC collapses on mobile and highlights the right section.
  - Copy link works.
- **Security check before publishing:** scanned the git history for `.env` files and tokens before making the repository public.

### Known limits of that testing

- The live TOC highlight is driven by `requestAnimationFrame`, which doesn't fire in the testing browser pane. Instead, the highlighting logic was checked against the real headings at several scroll positions. It should also be checked by scrolling in a normal browser.
- The native Share button only appears where the Web Share API exists (mostly mobile browsers), so it wasn't tested in that environment.

## Judgement calls

The AI suggested the trade-offs listed in the README (build-time fetch instead of Hugo content adapters, a custom serializer, Dart Sass from npm, Sanity's image CDN instead of Hugo image processing, a public dataset). I reviewed and accepted them. Where its first attempt was wrong (for example inaccurate alt text, a broken script edit, a doubled scroll offset), the errors were caught by running the code and checking the output, not by trusting it.
