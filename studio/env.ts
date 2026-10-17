/**
 * Studio environment. Values come from `SANITY_STUDIO_*` variables
 * (see studio/.env.example) so the project ID is never hard-coded.
 */
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? ''
export const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

if (!projectId) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID. Copy studio/.env.example to studio/.env and set your project ID.',
  )
}
