/**
 * Builds seed/seed.ndjson from the readable content in seed/content.mjs.
 *
 * Body copy is written in a tiny Markdown-like syntax and converted to
 * Portable Text here, so sample posts stay easy to read and edit:
 *   "## Heading", "### Heading", "#### Heading", "- bullet", "1. numbered",
 *   "> quote", anything else is a paragraph.
 *   Inline: **strong**, *em*, `code`, [text](url)
 *
 * Usage: npm run seed:build && npm run seed:import
 */
import {createHash} from 'node:crypto'
import {writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {authors, categories, posts} from './content.mjs'

const here = dirname(fileURLToPath(import.meta.url))

/** Deterministic 12-char key so re-running the build gives a stable diff. */
const key = (...parts) => createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 12)

const image = (url, alt) => ({
  _type: 'accessibleImage',
  _sanityAsset: `image@${url}`,
  alt,
  decorative: false,
})

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

function toSpans(text, blockKey) {
  const children = []
  const markDefs = []
  text
    .split(INLINE)
    .filter(Boolean)
    .forEach((chunk, i) => {
      const spanKey = key(blockKey, 's', i)
      let marks = []
      let value = chunk
      if (chunk.startsWith('**')) {
        marks = ['strong']
        value = chunk.slice(2, -2)
      } else if (chunk.startsWith('*')) {
        marks = ['em']
        value = chunk.slice(1, -1)
      } else if (chunk.startsWith('`')) {
        marks = ['code']
        value = chunk.slice(1, -1)
      } else if (chunk.startsWith('[')) {
        const [, label, href] = chunk.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        const linkKey = key(blockKey, 'l', i)
        markDefs.push({_key: linkKey, _type: 'link', href})
        marks = [linkKey]
        value = label
      }
      children.push({_key: spanKey, _type: 'span', marks, text: value})
    })
  return {children, markDefs}
}

function toPortableText(lines, docId) {
  return lines.map((line, i) => {
    const blockKey = key(docId, i)
    let style = 'normal'
    let listItem
    let text = line
    const heading = line.match(/^(#{2,4}) (.*)$/)
    if (heading) {
      style = `h${heading[1].length}`
      text = heading[2]
    } else if (line.startsWith('> ')) {
      style = 'blockquote'
      text = line.slice(2)
    } else if (line.startsWith('- ')) {
      listItem = 'bullet'
      text = line.slice(2)
    } else if (/^\d+\. /.test(line)) {
      listItem = 'number'
      text = line.replace(/^\d+\. /, '')
    }
    return {
      _key: blockKey,
      _type: 'block',
      style,
      ...(listItem && {listItem, level: 1}),
      ...toSpans(text, blockKey),
    }
  })
}

const docs = [
  ...categories.map((c) => ({
    _id: `category-${c.slug}`,
    _type: 'category',
    title: c.title,
    slug: {_type: 'slug', current: c.slug},
    ...(c.description && {description: c.description}),
  })),
  ...authors.map((a) => ({
    _id: `author-${a.slug}`,
    _type: 'author',
    name: a.name,
    slug: {_type: 'slug', current: a.slug},
    bio: a.bio,
    ...(a.image && {image: image(a.image, a.imageAlt)}),
  })),
  ...posts.map((p) => {
    const _id = `post-${p.slug}`
    return {
      _id,
      _type: 'post',
      title: p.title,
      slug: {_type: 'slug', current: p.slug},
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      heroImage: image(p.hero.url, p.hero.alt),
      category: {_type: 'reference', _ref: `category-${p.category}`},
      author: {_type: 'reference', _ref: `author-${p.author}`},
      body: toPortableText(p.body, _id),
    }
  }),
]

const out = join(here, 'seed.ndjson')
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
console.log(`Wrote ${docs.length} documents to ${out}`)
