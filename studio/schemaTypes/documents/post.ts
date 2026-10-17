import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => [
        rule.required().min(5).max(120),
        rule.max(70).warning('Titles over 70 characters may be truncated in search results.'),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      description: 'Used in the URL: /posts/<slug>/',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown on listing pages and used as the meta description.',
      validation: (rule) => rule.required().min(50).max(200),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'accessibleImage',
      group: 'content',
      validation: (rule) => rule.required().assetRequired(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Publish date, newest first',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      category: 'category.title',
      media: 'heroImage',
    },
    prepare({title, author, category, media}) {
      return {
        title,
        subtitle: [category, author && `by ${author}`].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
