/**
 * Sample content for the seed dataset. All people are fictional.
 * Images are placeholder photos from picsum.photos, downloaded by
 * `sanity dataset import` and stored as Sanity assets.
 */

const photo = (id) => `https://picsum.photos/id/${id}/1600/900.jpg`
const portrait = (id) => `https://picsum.photos/id/${id}/400/400.jpg`

export const categories = [
  {
    slug: 'content-strategy',
    title: 'Content Strategy',
    description: 'Modelling, planning and governing content so it stays useful as a site grows.',
  },
  {
    slug: 'web-development',
    title: 'Web Development',
    description: 'Practical notes on building fast, maintainable websites with static tooling.',
  },
  {
    slug: 'accessibility',
    title: 'Design & Accessibility',
    description: 'Inclusive design patterns that make content work for every reader.',
  },
  {
    // Intentionally no description: exercises the optional-field fallback.
    slug: 'performance',
    title: 'Performance',
  },
]

export const authors = [
  {
    slug: 'anika-rao',
    name: 'Anika Rao',
    bio: 'Content strategist who has spent a decade turning sprawling websites into structured, reusable content. Writes about modelling, governance and editorial workflow.',
    image: portrait(64),
    imageAlt: 'Anika Rao wearing sunglasses and holding a bunch of wildflowers in a field',
  },
  {
    slug: 'daniel-okafor',
    name: 'Daniel Okafor',
    bio: 'Front-end engineer focused on static site generators, build pipelines and performance budgets. Believes the fastest request is the one you never make.',
    image: portrait(91),
    imageAlt: 'Daniel Okafor holding a vintage twin-lens camera',
  },
  {
    // Intentionally no profile image: exercises the avatar fallback.
    slug: 'mei-lin',
    name: 'Mei Lin',
    bio: 'Accessibility specialist and UX writer. Helps teams ship interfaces that work with screen readers, keyboards and real-world attention spans.',
  },
]

export const posts = [
  {
    slug: 'why-structured-content-wins',
    title: 'Why structured content wins over page blobs',
    excerpt:
      'Treating content as data instead of formatted pages makes it reusable, testable and future-proof. Here is how to make the shift without overwhelming editors.',
    publishedAt: '2026-09-02T09:00:00Z',
    category: 'content-strategy',
    author: 'anika-rao',
    hero: {url: photo(1015), alt: 'Rocky clifftop overlooking a deep blue fjord between steep mountains'},
    body: [
      'Most websites start life as a collection of pages. Each page is a blob of formatted text, a few images and whatever layout tricks the editor could find in the toolbar. That works until the day you need the same content somewhere else.',
      '## The problem with page blobs',
      'A page blob mixes **what** the content says with **how** it should look. When a product description lives inside a hero banner, you cannot reuse it in a newsletter, an app or a search result without copying and pasting.',
      '- Content is duplicated across pages and drifts out of sync',
      '- Redesigns require editors to rewrite content, not just developers to restyle it',
      '- Validation is impossible because nothing has a defined shape',
      '## What structured content looks like',
      'Structured content breaks information into typed fields: a *title*, an *excerpt*, a *publish date*, a reference to an *author*. Presentation becomes the job of the front end.',
      '### References instead of copies',
      'An author is a document of its own. Posts **reference** the author rather than repeating their name and bio, so a single edit updates every page that mentions them.',
      '### Validation at the source',
      'Because every field has a type, the CMS can enforce rules: a slug must exist, an excerpt must stay under 200 characters, an image must have alt text. Mistakes are caught before they are published.',
      '## Making the shift',
      'Start small. Pick one content type that is reused often, model it carefully, and migrate it first. Editors learn the new approach on familiar material, and you learn where the model needs to bend.',
      '> Model the content you have, not the layout you want this quarter.',
      'Structured content is not about adding fields for the sake of it. It is about giving each piece of information a home, so it can travel wherever your audience is.',
    ],
  },
  {
    slug: 'getting-started-with-hugo-templates',
    title: 'Getting started with Hugo templates',
    excerpt:
      'Hugo templates look intimidating at first, but a handful of concepts—base layouts, blocks, partials and page variables—cover almost everything a blog needs.',
    publishedAt: '2026-09-10T09:00:00Z',
    category: 'web-development',
    author: 'daniel-okafor',
    hero: {url: photo(180), alt: 'Laptop on a wooden desk beside a notebook of wireframe sketches, a pen and a camera'},
    body: [
      'Hugo is one of the fastest static site generators available. It builds thousands of pages in seconds, ships as a single binary and needs no runtime on the server. The template language is the part that takes a little getting used to.',
      '## Base templates and blocks',
      'Every page in a Hugo site can share a single `baseof.html`. It defines the HTML skeleton and declares **blocks** that individual layouts fill in.',
      '1. Create `layouts/_default/baseof.html` with the document shell',
      '2. Declare a `main` block where page content goes',
      '3. Implement `single.html` and `list.html` by defining that block',
      '## Partials keep things tidy',
      'Repeated fragments such as the header, footer or a post card belong in **partials**. They accept a context, so the same card partial can render a post on the home page, a category page or an author page.',
      '### Passing context',
      'Use a dictionary when a partial needs more than one value. This keeps partials explicit about their inputs and easy to reuse.',
      '## Taxonomies for free',
      'Hugo understands taxonomies natively. Declare `categories` and `authors` in your configuration and Hugo generates list pages for every term automatically. You can attach extra data to a term by adding an `_index.md` file to its folder.',
      '> Let Hugo do the routing. Your job is to describe the content and choose how it looks.',
      'Read the [Hugo templating documentation](https://gohugo.io/templates/) once end to end. Most "how do I…" questions disappear after that first pass.',
    ],
  },
  {
    slug: 'writing-alt-text-that-helps',
    title: 'Writing alt text that actually helps',
    excerpt:
      'Alt text is not a caption and not a keyword dump. A few simple questions help editors write descriptions that genuinely serve screen-reader users.',
    publishedAt: '2026-09-18T09:00:00Z',
    category: 'accessibility',
    author: 'mei-lin',
    hero: {url: photo(1025), alt: 'A pug wrapped in a striped blanket, sitting on a forest path'},
    body: [
      'Alt text is read aloud by screen readers in place of an image. When it is missing, users hear a file name. When it is poor, they hear noise. When it is good, they get the same information as everyone else.',
      '## Ask what the image is for',
      'Before writing anything, decide what job the image does on the page. The same photo might need different alt text in different contexts.',
      '- **Informative** images convey content: describe what matters',
      '- **Functional** images are links or buttons: describe the action',
      '- **Decorative** images add mood only: use an empty alt so they are skipped',
      '## Keep it short and specific',
      'Aim for one sentence. Skip phrases like *image of* or *picture showing*; screen readers already announce that it is an image.',
      '### Good and bad examples',
      'A bad description says `dog`. A better one says *a pug wrapped in a striped blanket, sitting on a forest path*. It gives the listener the detail a sighted reader notices first.',
      '## Build it into the CMS',
      'The most reliable way to get good alt text is to make it part of the content model. Require it on every image field, and give editors an explicit **decorative** option instead of letting them leave the field blank.',
      '> If the image disappeared, what would the reader be missing? Write that.',
      'Alt text takes seconds to write and makes a real difference. Treat it as part of the content, not an afterthought.',
    ],
  },
  {
    slug: 'core-web-vitals-for-content-sites',
    title: 'Core Web Vitals for content-heavy sites',
    excerpt:
      'Blogs and marketing sites can score well on Core Web Vitals with a few deliberate choices around images, fonts and layout stability.',
    publishedAt: '2026-09-26T09:00:00Z',
    category: 'performance',
    author: 'daniel-okafor',
    hero: {url: photo(1043), alt: 'Granite cliffs rising above a pine forest and a calm river'},
    body: [
      'Core Web Vitals measure how quickly a page shows its main content, how soon it responds to input and how much it shifts around while loading. Content sites have an advantage: most of their pages are static.',
      '## Largest Contentful Paint',
      'On a blog post the largest element is usually the hero image. Make sure it is discovered early and delivered at the right size.',
      '- Serve responsive images with `srcset` and `sizes`',
      '- Use modern formats such as WebP or AVIF',
      '- Do not lazy-load the hero image; it is above the fold',
      '## Cumulative Layout Shift',
      'Layout shift happens when space is not reserved for content that loads later. Always set **width** and **height** on images so the browser can calculate the aspect ratio before the file arrives.',
      '### Fonts',
      'Web fonts can cause text to jump when they swap in. Prefer system font stacks, or preload one well-chosen font file and use `font-display: swap`.',
      '## Interaction to Next Paint',
      'Static pages rarely struggle here, but heavy third-party scripts can. Audit every script tag and ask whether it earns its place.',
      '> Performance is a feature your readers notice before they read a word.',
      'Measure with real-user data where you can, and set a budget so regressions are caught in review rather than in production.',
    ],
  },
  {
    slug: 'editorial-workflows-in-a-headless-cms',
    title: 'Designing editorial workflows in a headless CMS',
    excerpt:
      'A headless CMS gives you flexibility, but editors still need a clear path from draft to published. Here is how to design one that sticks.',
    publishedAt: '2026-10-04T09:00:00Z',
    category: 'content-strategy',
    author: 'mei-lin',
    hero: {url: photo(1067), alt: 'Aerial view of a city skyline beside a lake at sunset'},
    body: [
      'Going headless often removes the preview button editors relied on for years. Without a deliberate workflow, publishing turns into guesswork. With one, it becomes faster and safer than before.',
      '## Map the real process first',
      'Interview the people who publish. Most teams have an unwritten process: someone drafts, someone checks facts, someone approves. Write it down before configuring any tools.',
      '1. Draft and attach required metadata',
      '2. Review for accuracy, tone and accessibility',
      '3. Schedule or publish, then verify the live page',
      '## Use the CMS to enforce the basics',
      'Validation rules catch the mechanical mistakes—missing slugs, overly long titles, images without alt text—so reviewers can focus on substance.',
      '### Helpful previews',
      'Configure list previews that show the **category**, **author** and hero image. Editors can scan the content list and spot problems without opening every document.',
      '## Close the loop with automatic builds',
      'Connect a publish webhook to your hosting provider so every change triggers a fresh build. Editors see their work live within a minute, and nobody needs to ask a developer to deploy.',
      '> The best workflow is the one editors can follow without a manual.',
      'Revisit the workflow after a month. Remove steps nobody uses and automate the ones people keep forgetting.',
    ],
  },
  {
    slug: 'sass-architecture-for-small-sites',
    title: 'A simple Sass architecture for small sites',
    excerpt:
      'You do not need a framework to keep styles organised. A few partials, design tokens and mobile-first mixins go a long way on a small site.',
    publishedAt: '2026-10-12T09:00:00Z',
    category: 'web-development',
    author: 'anika-rao',
    hero: {url: photo(1074), alt: 'Close-up of a lioness looking directly at the camera'},
    body: [
      'Small sites deserve tidy stylesheets too. Without some structure, a single CSS file grows into a tangle of overrides that nobody dares to touch.',
      '## Start with tokens',
      'Put colours, spacing, type sizes and breakpoints in one place. Expose them as **CSS custom properties** so components can use them and themes can override them.',
      '## Organise by responsibility',
      'Split styles into partials that each have one job.',
      '- `abstracts`: variables, functions and mixins that output no CSS',
      '- `base`: resets, typography and element defaults',
      '- `layout`: header, footer and page grids',
      '- `components`: cards, buttons, the table of contents',
      '### Use the module system',
      'Modern Sass replaces `@import` with `@use` and `@forward`. Each partial declares its dependencies explicitly, which makes the order of styles predictable.',
      '## Mobile first, always',
      'Write the base styles for small screens and add a `min-width` media query mixin for larger layouts. The result is simpler CSS and a faster experience on phones.',
      '> Good architecture is the one where you can delete a component without fear.',
      'This approach scales comfortably to dozens of components and keeps the compiled CSS small enough to inline if you ever need to.',
    ],
  },
]
