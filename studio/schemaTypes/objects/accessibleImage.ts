import {defineField, defineType} from 'sanity'

/** Image with hotspot and required alt text (whenever an image is uploaded). */
export const accessibleImage = defineType({
  name: 'accessibleImage',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe the image for screen-reader users.',
      validation: (rule) =>
        rule.max(150).custom((alt, context) => {
          const parent = context.parent as {asset?: unknown} | undefined
          if (!parent?.asset) return true
          return alt?.trim() ? true : 'Alt text is required.'
        }),
    }),
  ],
})
