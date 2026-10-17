/**
 * Minimal Portable Text → Markdown serializer.
 *
 * Supports exactly what the Studio schema allows (studio/schemaTypes/objects/blockContent.ts):
 * h2–h4, blockquote, bullet/number lists (nested via `level`), strong, em, code,
 * strike-through, links, and inline images (delegated to `renderCustom`).
 *
 * Output is plain Markdown so Hugo's native .TableOfContents, .ReadingTime and
 * heading IDs work without extra code.
 */

export interface Span {
  _type: 'span'
  _key?: string
  text: string
  marks?: string[]
}

export interface MarkDef {
  _key: string
  _type: string
  href?: string
}

export interface TextBlock {
  _type: 'block'
  _key?: string
  style?: string
  listItem?: 'bullet' | 'number'
  level?: number
  children?: Array<Span | {_type: string}>
  markDefs?: MarkDef[]
}

export type PortableTextBlock = TextBlock | {_type: string; _key?: string; [key: string]: unknown}

export interface SerializeOptions {
  /** Render a non-text block (e.g. an image). Return null to skip it. */
  renderCustom?: (block: PortableTextBlock) => string | null
  /** Called for blocks that cannot be rendered, so callers can log them. */
  onUnknown?: (block: PortableTextBlock) => void
}

const DECORATORS: Record<string, string> = {
  strong: '**',
  em: '*',
  'strike-through': '~~',
}

/** Order in which marks are opened: links outermost, code innermost. */
const markRank = (mark: string, isLink: boolean): number => {
  if (isLink) return 0
  if (mark === 'code') return 9
  return Object.keys(DECORATORS).indexOf(mark) + 1 || 5
}

/** Escape characters that would otherwise be read as Markdown syntax. */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/([\\`*_[\]<>~|#])/g, '\\$1')
    .replace(/^(\s*)([-+])(?=\s)/gm, '$1\\$2')
    .replace(/^(\s*\d+)\.(?=\s)/gm, '$1\\.')
}

function codeSpan(text: string): string {
  const fence = text.includes('`') ? '``' : '`'
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : ''
  return `${fence}${pad}${text}${pad}${fence}`
}

function safeHref(href: string): string {
  return href.trim().replace(/\s/g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29')
}

const isSpan = (child: {_type: string}): child is Span => child._type === 'span'

/** Render the inline children of a text block. */
function renderInline(block: TextBlock): string {
  const markDefs = new Map((block.markDefs ?? []).map((def) => [def._key, def]))
  const stack: string[] = []
  let out = ''

  const opener = (mark: string): string => {
    const def = markDefs.get(mark)
    if (def) return def._type === 'link' && def.href ? '[' : ''
    return DECORATORS[mark] ?? ''
  }
  const closer = (mark: string): string => {
    const def = markDefs.get(mark)
    if (def) return def._type === 'link' && def.href ? `](${safeHref(def.href)})` : ''
    return DECORATORS[mark] ?? ''
  }

  /** Close a mark, keeping trailing whitespace outside the delimiter. */
  const close = (mark: string) => {
    const trailing = out.match(/\s+$/)?.[0] ?? ''
    out = out.slice(0, out.length - trailing.length) + closer(mark) + trailing
  }

  for (const child of block.children ?? []) {
    if (!isSpan(child) || !child.text) continue

    // Only marks we know how to render take part; unknown ones are ignored.
    const marks = (child.marks ?? []).filter((m) => m === 'code' || m in DECORATORS || markDefs.has(m))
    const inlineMarks = marks.filter((m) => m !== 'code')

    // Close marks that this span no longer has (innermost first).
    let keep = 0
    while (keep < stack.length && inlineMarks.includes(stack[keep])) keep++
    while (stack.length > keep) close(stack.pop()!)

    // Leading whitespace goes before any newly opened delimiters.
    const leading = child.text.match(/^\s+/)?.[0] ?? ''
    out += leading
    const body = child.text.slice(leading.length)

    const toOpen = inlineMarks
      .filter((m) => !stack.includes(m))
      .sort((a, b) => markRank(a, markDefs.has(a)) - markRank(b, markDefs.has(b)))
    for (const mark of toOpen) {
      out += opener(mark)
      stack.push(mark)
    }

    if (marks.includes('code')) {
      const trailing = body.match(/\s+$/)?.[0] ?? ''
      const code = body.slice(0, body.length - trailing.length)
      out += (code ? codeSpan(code) : '') + trailing
    } else {
      // Soft line breaks (shift+enter) become Markdown hard breaks.
      out += escapeMarkdown(body).replace(/\n/g, '  \n')
    }
  }
  while (stack.length) close(stack.pop()!)

  return out.trim()
}

function renderTextBlock(block: TextBlock): string {
  const text = renderInline(block)
  if (!text) return ''

  if (block.listItem) {
    const indent = '    '.repeat(Math.max(0, (block.level ?? 1) - 1))
    const marker = block.listItem === 'number' ? '1.' : '-'
    return `${indent}${marker} ${text}`
  }

  switch (block.style) {
    case 'h1': // Not offered in the schema (H1 is the post title); demote defensively.
    case 'h2':
      return `## ${text}`
    case 'h3':
      return `### ${text}`
    case 'h4':
    case 'h5':
    case 'h6':
      return `#### ${text}`
    case 'blockquote':
      return text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    default:
      return text
  }
}

/** Serialize an array of Portable Text blocks to Markdown. */
export function toMarkdown(blocks: PortableTextBlock[] | null | undefined, options: SerializeOptions = {}): string {
  const parts: string[] = []
  let previousWasList = false

  for (const block of blocks ?? []) {
    let rendered: string | null
    const isList = block._type === 'block' && Boolean((block as TextBlock).listItem)

    if (block._type === 'block') {
      rendered = renderTextBlock(block as TextBlock)
    } else {
      rendered = options.renderCustom?.(block) ?? null
      if (rendered === null) options.onUnknown?.(block)
    }
    if (!rendered) continue

    // Consecutive list items stay in one list; everything else is a new paragraph.
    const separator = parts.length === 0 ? '' : isList && previousWasList ? '\n' : '\n\n'
    parts.push(separator + rendered)
    previousWasList = isList
  }

  return parts.join('') + (parts.length ? '\n' : '')
}
