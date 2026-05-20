import type { TreeNode, TreeNodeType } from './treeTaxonomy'
import { collectLeafDescendants, findTreeNodeById } from './treeTaxonomy'

const TYPE_LABEL: Record<TreeNodeType, string> = {
  patient: 'Patient root',
  branch: 'Top-level section',
  category: 'Taxonomy category',
  subcategory: 'Clinical subcategory',
  leaf: 'Extracted keyword',
}

const SUBCATEGORY_HINTS: Record<string, string> = {
  'medical-history.comorbidities.cardiovascular':
    'Cardiovascular comorbidities that may affect treatment tolerance, drug interactions, or surgical risk.',
  'medical-history.comorbidities.endocrine':
    'Endocrine conditions such as diabetes or thyroid disease that influence monitoring and therapy choices.',
  'medical-history.comorbidities.renal-hepatic':
    'Renal or hepatic impairment affecting drug clearance and dose adjustments.',
  'medical-history.prior-malignancies.secondary':
    'History of other primary cancers relevant to surveillance and cumulative toxicity.',
  'medical-history.prior-malignancies.prior-treatments':
    'Prior systemic or local therapies that constrain future options.',
  'medical-history.family-history.pedigree':
    'Family cancer patterns suggesting inherited risk.',
  'medical-history.family-history.syndromes':
    'Known or suspected hereditary cancer syndromes.',
  'diagnosis.primary-tumor.anatomy':
    'Anatomic site and laterality of the primary tumor.',
  'diagnosis.primary-tumor.histology':
    'Histologic subtype driving prognosis and targeted therapy.',
  'diagnosis.primary-tumor.grade':
    'Tumor grade reflecting differentiation and aggressiveness.',
  'diagnosis.staging.t': 'Primary tumor extent (T category).',
  'diagnosis.staging.n': 'Regional lymph node involvement (N category).',
  'diagnosis.staging.m': 'Distant metastasis status (M category).',
  'diagnosis.staging.group': 'Overall anatomic stage grouping derived from TNM.',
  'diagnosis.biomarkers.ihc': 'Immunohistochemistry markers from tumor tissue.',
  'diagnosis.biomarkers.serology': 'Serologic or immunologic blood-based markers.',
  'diagnosis.biomarkers.ngs': 'Next-generation sequencing variants and fusions.',
  'diagnosis.biomarkers.instability': 'Microsatellite instability (MSI) and tumor mutational burden (TMB).',
  'diagnosis.metastatic.sites': 'Anatomic locations of metastatic disease.',
  'diagnosis.metastatic.volume': 'Overall burden and distribution of metastatic disease.',
  'diagnosis.general.conditions': 'Active non-oncology or general clinical findings.',
}

function parentPath(taxonomyPath: string): string | null {
  const parts = taxonomyPath.split('.')
  if (parts.length <= 1) return null
  return parts.slice(0, -1).join('.')
}

/** Ancestor labels from root → parent (excludes the node itself). */
export function getNodeAncestry(root: TreeNode, nodeId: string): TreeNode[] {
  const trail: TreeNode[] = []
  function walk(n: TreeNode, stack: TreeNode[]): boolean {
    if (n.id === nodeId) {
      trail.push(...stack)
      return true
    }
    for (const ch of n.children ?? []) {
      if (walk(ch, [...stack, n])) return true
    }
    return false
  }
  walk(root, [])
  return trail.filter((n) => n.type !== 'patient')
}

/** Leaf siblings under the same immediate parent subcategory. */
export function getSiblingLeaves(root: TreeNode, node: TreeNode): TreeNode[] {
  const parentPathStr = parentPath(node.taxonomyPath)
  if (!parentPathStr) return []
  const byPath = (n: TreeNode): TreeNode | null => {
    if (n.taxonomyPath === parentPathStr) return n
    for (const ch of n.children ?? []) {
      const hit = byPath(ch)
      if (hit) return hit
    }
    return null
  }
  const p = byPath(root)
  if (!p) return []
  return collectLeafDescendants(p).filter((l) => l.id !== node.id)
}

function subcategoryHint(taxonomyPath: string): string | null {
  const parts = taxonomyPath.split('.')
  for (let len = parts.length; len >= 2; len--) {
    const key = parts.slice(0, len).join('.')
    if (SUBCATEGORY_HINTS[key]) return SUBCATEGORY_HINTS[key]
  }
  return null
}

function formatAncestry(ancestors: TreeNode[]): string {
  if (ancestors.length === 0) return 'the patient root'
  return ancestors.map((a) => a.label).join(' → ')
}

/** Narrative overview when the pointer rests on a single node. */
export function buildHoverOverview(root: TreeNode, node: TreeNode): string {
  const ancestors = getNodeAncestry(root, node.id)
  const ancestryText = formatAncestry(ancestors)
  const hint = subcategoryHint(node.taxonomyPath)
  const typeLabel = TYPE_LABEL[node.type]

  const parts: string[] = [
    `You're looking at **${node.label}** (${typeLabel.toLowerCase()}).`,
    `It sits under ${ancestryText}.`,
  ]

  if (hint) parts.push(hint)

  if (node.type === 'leaf') {
    const siblings = getSiblingLeaves(root, node)
    if (siblings.length > 0) {
      parts.push(
        `Related keywords in the same subcategory: ${siblings.map((s) => s.label).join(', ')}.`,
      )
    }
    if (node.pubmedAvailable !== false) {
      parts.push('Click this leaf to load cached PubMed literature in the panel above.')
    }
  } else {
    const leaves = collectLeafDescendants(node)
    if (leaves.length > 0) {
      parts.push(
        `This branch contains ${leaves.length} extracted keyword${leaves.length === 1 ? '' : 's'}: ${leaves
          .slice(0, 6)
          .map((l) => l.label)
          .join(', ')}${leaves.length > 6 ? ', …' : ''}.`,
      )
    } else {
      parts.push('No patient-specific keywords are attached here yet.')
    }
  }

  return parts.join('\n\n')
}

interface ViewportGroup {
  branch: string
  categories: { label: string; leaves: TreeNode[]; scaffold: TreeNode[] }[]
}

function groupVisibleNodes(root: TreeNode, visibleIds: ReadonlySet<string>): ViewportGroup[] {
  const groups = new Map<string, ViewportGroup>()

  function walk(n: TreeNode, branchLabel: string | null) {
    if (!visibleIds.has(n.id)) {
      n.children?.forEach((ch) => walk(ch, branchLabel))
      return
    }

    let branch = branchLabel
    if (n.type === 'branch') branch = n.label

    if (n.type === 'leaf' && branch) {
      const ancestors = getNodeAncestry(root, n.id)
      const category = ancestors.find((a) => a.type === 'category')?.label ?? 'Other'
      let g = groups.get(branch)
      if (!g) {
        g = { branch, categories: [] }
        groups.set(branch, g)
      }
      let cat = g.categories.find((c) => c.label === category)
      if (!cat) {
        cat = { label: category, leaves: [], scaffold: [] }
        g.categories.push(cat)
      }
      cat.leaves.push(n)
    } else if (n.type !== 'leaf' && n.type !== 'patient' && branch) {
      const ancestors = getNodeAncestry(root, n.id)
      const category =
        n.type === 'category'
          ? n.label
          : ancestors.find((a) => a.type === 'category')?.label ?? n.label
      let g = groups.get(branch)
      if (!g) {
        g = { branch, categories: [] }
        groups.set(branch, g)
      }
      let cat = g.categories.find((c) => c.label === category)
      if (!cat) {
        cat = { label: category, leaves: [], scaffold: [] }
        g.categories.push(cat)
      }
      if (n.type === 'category' || n.type === 'subcategory') {
        if (!cat.scaffold.some((s) => s.id === n.id)) cat.scaffold.push(n)
      }
    }

    n.children?.forEach((ch) => walk(ch, branch))
  }

  walk(root, null)
  return [...groups.values()]
}

/** Overview of everything currently framed in the tree viewport. */
export function buildViewportOverview(root: TreeNode, visibleIds: ReadonlySet<string>): string {
  if (visibleIds.size === 0) {
    return 'Pan or zoom the tree so taxonomy nodes enter the view — I will summarize what is on screen.'
  }

  const visibleLeaves = collectLeafDescendants(root).filter((l) => visibleIds.has(l.id))
  const visibleScaffold = [...visibleIds]
    .map((id) => findTreeNodeById(root, id))
    .filter((n): n is TreeNode => n !== null && n.type !== 'leaf' && n.type !== 'patient')

  const parts: string[] = []

  if (visibleLeaves.length === 0 && visibleScaffold.length === 0) {
    parts.push('The current view shows part of the taxonomy structure without extracted keywords in frame.')
  } else {
    parts.push(
      `In your current view I see **${visibleLeaves.length} keyword${visibleLeaves.length === 1 ? '' : 's'}** and **${visibleScaffold.length} taxonomy node${visibleScaffold.length === 1 ? '' : 's'}**.`,
    )
  }

  const groups = groupVisibleNodes(root, visibleIds)
  for (const g of groups) {
    parts.push(`\n**${g.branch}**`)
    for (const cat of g.categories) {
      const hint = cat.scaffold.map((s) => subcategoryHint(s.taxonomyPath)).find(Boolean)
      if (cat.leaves.length > 0) {
        parts.push(`_${cat.label}_ — ${cat.leaves.map((l) => l.label).join(', ')}`)
      } else if (cat.scaffold.length > 0) {
        parts.push(`_${cat.label}_ — ${cat.scaffold.map((s) => s.label).join(', ')} (structure only)`)
      }
      if (hint && cat.leaves.length > 0) parts.push(hint)
    }
  }

  if (visibleLeaves.length >= 2) {
    const byParent = new Map<string, TreeNode[]>()
    for (const leaf of visibleLeaves) {
      const p = parentPath(leaf.taxonomyPath) ?? 'other'
      const list = byParent.get(p) ?? []
      list.push(leaf)
      byParent.set(p, list)
    }
    const clusters = [...byParent.values()].filter((v) => v.length >= 2)
    if (clusters.length > 0) {
      parts.push(
        '\n**Relationships in view:** ' +
          clusters
            .map((cluster) => cluster.map((l) => l.label).join(' ↔ '))
            .slice(0, 4)
            .join('; ') +
          '.',
      )
    }
  }

  if (visibleLeaves.length > 0) {
    parts.push('\nHover a specific node for a focused breakdown, or click a green leaf for PubMed.')
  }

  return parts.join('\n')
}
