/**
 * Optional UI-only keywords when the API has no `keyword_nodes` (404) or you want
 * extra chips without seeding Postgres. Disabled unless `VITE_DEMO_KEYWORD_LEAVES=true`.
 * IDs use the `demo-` prefix so they never collide with pipeline-generated ids.
 */
export type DemoKeywordLeaf = {
  id: string
  label: string
  taxonomyPath: string
  pubmedAvailable?: boolean
}

export const DEMO_KEYWORD_LEAVES_BY_PATIENT: Readonly<Record<string, readonly DemoKeywordLeaf[]>> = {
  'p-1': [
    {
      id: 'demo-mh-fh-pedigree-brca',
      label: 'Family: maternal breast cancer',
      taxonomyPath: 'medical-history.family-history.pedigree',
    },
    {
      id: 'demo-mh-fh-synd-lynch',
      label: 'Lynch syndrome screening discussed',
      taxonomyPath: 'medical-history.family-history.syndromes',
    },
    {
      id: 'demo-dx-bio-er',
      label: 'ER positive',
      taxonomyPath: 'diagnosis.biomarkers.ihc',
    },
    {
      id: 'demo-dx-stg-group',
      label: 'Stage IIA',
      taxonomyPath: 'diagnosis.staging.group',
    },
  ],
}
