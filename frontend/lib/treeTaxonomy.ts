// Canonical hierarchical taxonomy for the patient keyword tree.
//
// Shape decisions:
//   - Patient is the root.
//   - Two root branches: "Medical History" and "Diagnosis".
//   - The taxonomy below is the oncology-flavored default from Laura
//     (2026-05-11). The Diagnosis sub-tree adapts for non-oncology
//     conditions (e.g. hypertension), but the static scaffolding lives here.
//   - Patient-specific extracted keywords hang off the leaves below by
//     setting their `taxonomyPath` to the parent path string
//     (e.g. "diagnosis.biomarkers-molecular.ihc").

export type TreeNodeType =
  | 'patient'
  | 'branch'        // Medical History / Diagnosis
  | 'category'      // 1.1, 2.1, etc.
  | 'subcategory'   // Cardiovascular, IHC, etc.
  | 'leaf'          // patient-specific extracted keyword

export interface TreeNode {
  id: string
  label: string
  type: TreeNodeType
  /** Dot-delimited path identifying this node in the taxonomy. */
  taxonomyPath: string
  /** True when clicking should trigger a PubMed lookup. */
  pubmedAvailable?: boolean
  children?: TreeNode[]
}

/** Canonical taxonomy scaffold. IDs are stable so the API can reference them. */
export const TAXONOMY_SCAFFOLD: Omit<TreeNode, 'id' | 'taxonomyPath'> & {
  id: string
  taxonomyPath: string
  children: TaxonomyNode[]
} = {
  id: 'root',
  label: 'Patient',
  type: 'patient',
  taxonomyPath: 'root',
  children: [
    {
      id: 'medical-history',
      label: 'Medical History',
      type: 'branch',
      taxonomyPath: 'medical-history',
      children: [
        {
          id: 'mh-comorbidities',
          label: 'Comorbidities',
          type: 'category',
          taxonomyPath: 'medical-history.comorbidities',
          children: [
            { id: 'mh-comorbidities-cardiovascular', label: 'Cardiovascular', type: 'subcategory', taxonomyPath: 'medical-history.comorbidities.cardiovascular' },
            { id: 'mh-comorbidities-endocrine', label: 'Endocrine', type: 'subcategory', taxonomyPath: 'medical-history.comorbidities.endocrine' },
            { id: 'mh-comorbidities-renal-hepatic', label: 'Renal / Hepatic', type: 'subcategory', taxonomyPath: 'medical-history.comorbidities.renal-hepatic' },
          ],
        },
        {
          id: 'mh-prior-malignancies',
          label: 'Prior Malignancies',
          type: 'category',
          taxonomyPath: 'medical-history.prior-malignancies',
          children: [
            { id: 'mh-prior-malignancies-secondary', label: 'Secondary Primaries', type: 'subcategory', taxonomyPath: 'medical-history.prior-malignancies.secondary' },
            { id: 'mh-prior-malignancies-prior-treatments', label: 'Prior Treatments', type: 'subcategory', taxonomyPath: 'medical-history.prior-malignancies.prior-treatments' },
          ],
        },
        {
          id: 'mh-family-history',
          label: 'Family Cancer History',
          type: 'category',
          taxonomyPath: 'medical-history.family-history',
          children: [
            { id: 'mh-family-history-pedigree', label: 'Pedigree Data', type: 'subcategory', taxonomyPath: 'medical-history.family-history.pedigree' },
            { id: 'mh-family-history-syndromes', label: 'Genetic Syndromes', type: 'subcategory', taxonomyPath: 'medical-history.family-history.syndromes' },
          ],
        },
        {
          id: 'mh-surgical',
          label: 'Past Surgical History',
          type: 'category',
          taxonomyPath: 'medical-history.surgical',
          children: [
            { id: 'mh-surgical-major', label: 'Major Procedures', type: 'subcategory', taxonomyPath: 'medical-history.surgical.major' },
            { id: 'mh-surgical-access', label: 'Access Devices', type: 'subcategory', taxonomyPath: 'medical-history.surgical.access' },
          ],
        },
        {
          id: 'mh-social',
          label: 'Social & Environmental',
          type: 'category',
          taxonomyPath: 'medical-history.social',
          children: [
            { id: 'mh-social-tobacco', label: 'Tobacco / Vaping', type: 'subcategory', taxonomyPath: 'medical-history.social.tobacco' },
            { id: 'mh-social-occupational', label: 'Occupational Exposures', type: 'subcategory', taxonomyPath: 'medical-history.social.occupational' },
          ],
        },
      ],
    },
    {
      id: 'diagnosis',
      label: 'Diagnosis',
      type: 'branch',
      taxonomyPath: 'diagnosis',
      children: [
        {
          id: 'dx-primary-tumor',
          label: 'Primary Tumor',
          type: 'category',
          taxonomyPath: 'diagnosis.primary-tumor',
          children: [
            { id: 'dx-primary-tumor-anatomy', label: 'Anatomy', type: 'subcategory', taxonomyPath: 'diagnosis.primary-tumor.anatomy' },
            { id: 'dx-primary-tumor-histology', label: 'Histology', type: 'subcategory', taxonomyPath: 'diagnosis.primary-tumor.histology' },
            { id: 'dx-primary-tumor-grade', label: 'Grade', type: 'subcategory', taxonomyPath: 'diagnosis.primary-tumor.grade' },
          ],
        },
        {
          id: 'dx-staging',
          label: 'Anatomic Staging (TNM)',
          type: 'category',
          taxonomyPath: 'diagnosis.staging',
          children: [
            { id: 'dx-staging-t', label: 'T — Tumor', type: 'subcategory', taxonomyPath: 'diagnosis.staging.t' },
            { id: 'dx-staging-n', label: 'N — Nodes', type: 'subcategory', taxonomyPath: 'diagnosis.staging.n' },
            { id: 'dx-staging-m', label: 'M — Metastasis', type: 'subcategory', taxonomyPath: 'diagnosis.staging.m' },
            { id: 'dx-staging-group', label: 'Stage Grouping', type: 'subcategory', taxonomyPath: 'diagnosis.staging.group' },
          ],
        },
        {
          id: 'dx-biomarkers',
          label: 'Biomarkers & Molecular',
          type: 'category',
          taxonomyPath: 'diagnosis.biomarkers',
          children: [
            { id: 'dx-biomarkers-ihc', label: 'Tissue Markers (IHC)', type: 'subcategory', taxonomyPath: 'diagnosis.biomarkers.ihc' },
            { id: 'dx-biomarkers-serology', label: 'Serology / Immunology', type: 'subcategory', taxonomyPath: 'diagnosis.biomarkers.serology' },
            { id: 'dx-biomarkers-ngs', label: 'NGS Variants', type: 'subcategory', taxonomyPath: 'diagnosis.biomarkers.ngs' },
            { id: 'dx-biomarkers-instability', label: 'MSI / TMB', type: 'subcategory', taxonomyPath: 'diagnosis.biomarkers.instability' },
          ],
        },
        {
          id: 'dx-metastatic',
          label: 'Metastatic Profile',
          type: 'category',
          taxonomyPath: 'diagnosis.metastatic',
          children: [
            { id: 'dx-metastatic-sites', label: 'Sites of Metastasis', type: 'subcategory', taxonomyPath: 'diagnosis.metastatic.sites' },
            { id: 'dx-metastatic-volume', label: 'Disease Volume', type: 'subcategory', taxonomyPath: 'diagnosis.metastatic.volume' },
          ],
        },
        {
          id: 'dx-general',
          label: 'Active Conditions',
          type: 'category',
          taxonomyPath: 'diagnosis.general',
          children: [
            { id: 'dx-general-conditions', label: 'General Findings', type: 'subcategory', taxonomyPath: 'diagnosis.general.conditions' },
          ],
        },
      ],
    },
  ],
}

type TaxonomyNode = {
  id: string
  label: string
  type: TreeNodeType
  taxonomyPath: string
  children?: TaxonomyNode[]
}

/** Recursively clone the scaffold so callers can mutate it safely. */
export function cloneScaffold(): TreeNode {
  function clone(node: TaxonomyNode): TreeNode {
    return {
      id: node.id,
      label: node.label,
      type: node.type,
      taxonomyPath: node.taxonomyPath,
      children: node.children?.map(clone),
    }
  }
  return clone(TAXONOMY_SCAFFOLD as TaxonomyNode)
}

/**
 * Merge patient-specific extracted nodes into the static scaffold.
 *
 * Each `patientNode` carries a `taxonomyPath` that points to the parent
 * subcategory it hangs off. Nodes whose path does not match any scaffold
 * subcategory are dropped (the Bedrock prompt should keep them aligned).
 */
export function buildPatientTree(
  patientNodes: { id: string; label: string; taxonomyPath: string; pubmedAvailable?: boolean }[],
  patientName: string,
): TreeNode {
  const tree = cloneScaffold()
  tree.label = patientName

  // index parent nodes by path for fast attachment
  const byPath = new Map<string, TreeNode>()
  function index(node: TreeNode) {
    byPath.set(node.taxonomyPath, node)
    node.children?.forEach(index)
  }
  index(tree)

  for (const p of patientNodes) {
    const parent = byPath.get(p.taxonomyPath)
    if (!parent) continue
    parent.children = parent.children ?? []
    parent.children.push({
      id: p.id,
      label: p.label,
      type: 'leaf',
      taxonomyPath: `${p.taxonomyPath}.${p.id}`,
      pubmedAvailable: p.pubmedAvailable ?? true,
    })
  }

  // Prune scaffold nodes that have no leaf descendants — keeps the tree
  // clean for patients who don't have data in every category.
  function hasLeaf(node: TreeNode): boolean {
    if (node.type === 'leaf') return true
    return node.children?.some(hasLeaf) ?? false
  }
  function prune(node: TreeNode): TreeNode {
    return {
      ...node,
      children: node.children
        ?.filter(hasLeaf)
        .map(prune),
    }
  }

  return prune(tree)
}
