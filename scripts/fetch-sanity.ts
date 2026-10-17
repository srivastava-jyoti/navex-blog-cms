/**
 * Fetches published content from Sanity and writes it as Hugo content:
 *
 *   web/content/posts/<slug>.md                 one file per blog post
 *   web/content/authors/<slug>/_index.md        author taxonomy term data
 *   web/content/categories/<slug>/_index.md     category taxonomy term data
 *
 * Front matter is JSON (valid Hugo front matter, and no YAML escaping pitfalls).
 * Documents missing required data are skipped with a warning instead of
 * failing the build, so one bad document cannot take the site down.
 *
 * Usage: npm run fetch   (reads SANITY_* from the environment or a root .env file)
 */
import {createClient} from '@sanity/client'
import {mkdir, rm, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {toMarkdown, type PortableTextBlock} from './lib/portableText.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'web', 'content')

try {
  process.loadEnvFile(join(root, '.env'))
} catch {
  // No .env file: rely on real environment variables (e.g. on Netlify).
}

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET ?? 'production'
const apiVersion = process.env.SANITY_API_VERSION ?? '2025-10-01'

if (!projectId) {
  console.error('✖ SANITY_PROJECT_ID is not set. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const client = createClient({projectId, dataset, apiVersion, useCdn: false, perspective: 'published'})

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const IMAGE = `{
  alt, hotspot,
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`

const QUERY = `{
  "posts": *[_type == "post"] | order(publishedAt desc) {
    _id, _updatedAt, title, "slug": slug.current, excerpt, publishedAt,
    heroImage ${IMAGE},
    "category": category->{ "slug": slug.current, title },
    "author": author->{ "slug": slug.current, name },
    body[] {
      ...,
      _type == "accessibleImage" => ${IMAGE}
    }
  },
  "authors": *[_type == "author"] | order(name asc) {
    _id, name, "slug": slug.current, bio, image ${IMAGE}
  },
  "categories": *[_type == "category"] | order(title asc) {
    _id, title, "slug": slug.current, description
  }
}`

// ---------------------------------------------------------------------------
// Types (shape of the query result; every field may be missing)
// ---------------------------------------------------------------------------

interface SanityImage {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  hotspot?: {x: number; y: number} | null
}

interface Post {
  _id: string
  _updatedAt?: string
  title?: string | null
  slug?: string | null
  excerpt?: string | null
  publishedAt?: string | null
  heroImage?: SanityImage | null
  category?: {slug?: string | null; title?: string | null} | null
  author?: {slug?: string | null; name?: string | null} | null
  body?: PortableTextBlock[] | null
}

interface Author {
  _id: string
  name?: string | null
  slug?: string | null
  bio?: string | null
  image?: SanityImage | null
}

interface Category {
  _id: string
  title?: string | null
  slug?: string | null
  description?: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const warnings: string[] = []
const warn = (message: string) => warnings.push(message)

/** Normalise an image to front-matter data, or undefined if it has no asset. */
function imageData(image: SanityImage | null | undefined) {
  if (!image?.url) return undefined
  return {
    url: image.url,
    alt: (image.alt ?? '').trim(),
    width: image.width ?? undefined,
    height: image.height ?? undefined,
    // Focal point for Sanity's image API (crop=focalpoint&fp-x=…&fp-y=…).
    focalX: image.hotspot?.x ?? 0.5,
    focalY: image.hotspot?.y ?? 0.5,
  }
}

/** Hugo shortcode params use backtick raw strings, so strip backticks. */
const raw = (value: string | number | undefined) => `\`${String(value ?? '').replace(/`/g, "'")}\``

function renderBodyImage(block: PortableTextBlock): string | null {
  if (block._type !== 'accessibleImage') return null
  const img = imageData(block as SanityImage)
  if (!img) return null
  const params = [
    `src=${raw(img.url)}`,
    `alt=${raw(img.alt)}`,
    img.width && `width=${raw(img.width)}`,
    img.height && `height=${raw(img.height)}`,
  ].filter(Boolean)
  return `{{< sanity-image ${params.join(' ')} >}}`
}

/** Hugo content file: JSON front matter followed by a Markdown body. */
function contentFile(frontMatter: Record<string, unknown>, body = ''): string {
  const clean = JSON.parse(JSON.stringify(frontMatter)) // drops undefined values
  return `${JSON.stringify(clean, null, 2)}\n\n${body}`
}

async function write(path: string, contents: string) {
  await mkdir(dirname(path), {recursive: true})
  await writeFile(path, contents, 'utf8')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`→ Fetching from Sanity (${projectId}/${dataset})…`)
  const {posts, authors, categories} = await client.fetch<{
    posts: Post[]
    authors: Author[]
    categories: Category[]
  }>(QUERY)

  // Generated folders are rebuilt from scratch so deleted documents disappear.
  for (const dir of ['posts', 'authors', 'categories']) {
    await rm(join(contentDir, dir), {recursive: true, force: true})
  }

  const count = {posts: 0, authors: 0, categories: 0}
  for (const post of posts) {
    if (!post.slug || !post.title) {
      warn(`post ${post._id}: missing ${post.slug ? 'title' : 'slug'}, skipped`)
      continue
    }
    if (!post.publishedAt) warn(`post "${post.slug}": no publish date, using last update time`)
    if (!post.heroImage?.url) warn(`post "${post.slug}": no hero image`)
    if (!post.author?.slug) warn(`post "${post.slug}": no author`)
    if (!post.category?.slug) warn(`post "${post.slug}": no category`)

    const body = toMarkdown(post.body, {
      renderCustom: renderBodyImage,
      onUnknown: (block) => warn(`post "${post.slug}": skipped unsupported block type "${block._type}"`),
    })

    const frontMatter = {
      title: post.title,
      slug: post.slug,
      date: post.publishedAt ?? post._updatedAt,
      lastmod: post._updatedAt,
      description: post.excerpt ?? undefined,
      hero: imageData(post.heroImage),
      categories: post.category?.slug ? [post.category.slug] : undefined,
      authors: post.author?.slug ? [post.author.slug] : undefined,
      sanityId: post._id,
    }
    await write(join(contentDir, 'posts', `${post.slug}.md`), contentFile(frontMatter, body))
    count.posts++
  }

  for (const author of authors) {
    if (!author.slug || !author.name) {
      warn(`author ${author._id}: missing name or slug, skipped`)
      continue
    }
    await write(
      join(contentDir, 'authors', author.slug, '_index.md'),
      contentFile({title: author.name, bio: author.bio ?? undefined, image: imageData(author.image)}),
    )
    count.authors++
  }

  for (const category of categories) {
    if (!category.slug || !category.title) {
      warn(`category ${category._id}: missing title or slug, skipped`)
      continue
    }
    await write(
      join(contentDir, 'categories', category.slug, '_index.md'),
      contentFile({title: category.title, description: category.description ?? undefined}),
    )
    count.categories++
  }

  console.log(`✔ Wrote ${count.posts} posts, ${count.authors} authors, ${count.categories} categories`)
  for (const message of warnings) console.warn(`  ⚠ ${message}`)
}

main().catch((error) => {
  console.error('✖ Failed to fetch content from Sanity:', error instanceof Error ? error.message : error)
  process.exit(1)
})
