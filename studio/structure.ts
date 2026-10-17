import type {StructureResolver} from 'sanity/structure'

/** Desk structure: posts first, then the taxonomies they reference. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('post').title('Blog posts'),
      S.divider(),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
    ])
