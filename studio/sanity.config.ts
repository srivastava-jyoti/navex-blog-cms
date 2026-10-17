import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {dataset, projectId} from './env'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Navex Blog CMS',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {types: schemaTypes},
})
