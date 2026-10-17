import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {escapeMarkdown, toMarkdown, type PortableTextBlock} from './portableText.ts'

const block = (children: Array<{text: string; marks?: string[]}>, extra: Record<string, unknown> = {}) =>
  ({
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: children.map((c) => ({_type: 'span', marks: [], ...c})),
    ...extra,
  }) as PortableTextBlock

describe('toMarkdown', () => {
  it('returns an empty string for missing or empty bodies', () => {
    assert.equal(toMarkdown(undefined), '')
    assert.equal(toMarkdown(null), '')
    assert.equal(toMarkdown([]), '')
  })

  it('renders headings and paragraphs separated by blank lines', () => {
    const md = toMarkdown([block([{text: 'Intro'}], {style: 'h2'}), block([{text: 'Hello.'}])])
    assert.equal(md, '## Intro\n\nHello.\n')
  })

  it('demotes h1 to h2 so the post title stays the only h1', () => {
    assert.equal(toMarkdown([block([{text: 'Title'}], {style: 'h1'})]), '## Title\n')
  })

  it('keeps consecutive list items in one list, with nesting', () => {
    const md = toMarkdown([
      block([{text: 'one'}], {listItem: 'bullet', level: 1}),
      block([{text: 'nested'}], {listItem: 'bullet', level: 2}),
      block([{text: 'two'}], {listItem: 'number', level: 1}),
      block([{text: 'after'}]),
    ])
    assert.equal(md, '- one\n    - nested\n1. two\n\nafter\n')
  })

  it('renders decorators and keeps whitespace outside delimiters', () => {
    const md = toMarkdown([
      block([{text: 'a '}, {text: 'bold ', marks: ['strong']}, {text: 'and '}, {text: 'em', marks: ['em']}]),
    ])
    assert.equal(md, 'a **bold** and *em*\n')
  })

  it('merges adjacent spans that share a mark', () => {
    const md = toMarkdown([
      block([
        {text: 'bold ', marks: ['strong']},
        {text: 'both', marks: ['strong', 'em']},
      ]),
    ])
    assert.equal(md, '**bold *both***\n')
  })

  it('renders links and inline code', () => {
    const md = toMarkdown([
      block([{text: 'see '}, {text: 'docs', marks: ['l1']}, {text: ' and '}, {text: 'a_b', marks: ['code']}], {
        markDefs: [{_key: 'l1', _type: 'link', href: 'https://example.com/a (b)'}],
      }),
    ])
    assert.equal(md, 'see [docs](https://example.com/a%20%28b%29) and `a_b`\n')
  })

  it('escapes Markdown syntax in plain text', () => {
    assert.equal(escapeMarkdown('1. not a list *really*'), '1\\. not a list \\*really\\*')
    assert.equal(toMarkdown([block([{text: '# not a heading'}])]), '\\# not a heading\n')
  })

  it('delegates custom blocks and reports unknown ones', () => {
    const unknown: string[] = []
    const md = toMarkdown([{_type: 'accessibleImage'}, {_type: 'video'}], {
      renderCustom: (b) => (b._type === 'accessibleImage' ? '{{< img >}}' : null),
      onUnknown: (b) => unknown.push(b._type),
    })
    assert.equal(md, '{{< img >}}\n')
    assert.deepEqual(unknown, ['video'])
  })
})
