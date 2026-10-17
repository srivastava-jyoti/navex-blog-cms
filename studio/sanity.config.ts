import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {dataset, projectId} from './env'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Navex Blog CMS',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool()],
  schema: {types: schemaTypes},
})
