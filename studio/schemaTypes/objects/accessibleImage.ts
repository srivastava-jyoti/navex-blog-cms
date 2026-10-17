import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Image with hotspot and alt text. Alt text is required unless the editor
 * explicitly marks the image as decorative, so every rendered <img> gets
 * a meaningful (or intentionally empty) alt attribute.
 */
export const accessibleImage = defineType({
  name: 'accessibleImage',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe the image for screen-reader users.',
      hidden: ({parent}) => Boolean(parent?.decorative),
      validation: (rule) =>
        rule
          .max(150)
          .warning('Keep alt text under 150 characters.')
          .custom((alt, context) => {
            const parent = context.parent as {asset?: unknown; decorative?: boolean} | undefined
            if (!parent?.asset || parent.decorative) return true
            return alt?.trim() ? true : 'Alt text is required (or mark the image as decorative).'
          }),
    }),
    defineField({
      name: 'decorative',
      title: 'Decorative image',
      type: 'boolean',
      description: 'Decorative images are hidden from screen readers (empty alt).',
      initialValue: false,
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional visible caption.',
      validation: (rule) => rule.max(200),
    }),
  ],
})
