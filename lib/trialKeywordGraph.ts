import { keytrudaFdaKeywords, type FdaKeyword } from "./keytrudaFdaKeywords";
import { getPatientRelevantNodes } from "./patientNodeRelevance";
import type { Patient } from "./patients";

/** Logical connections between BLA 125514 clinical keywords (for canvas edges). */
export const TRIAL_KEYWORD_EDGES: [string, string][] = [
  ["pd1-blockade", "checkpoint-inhibitor"],
  ["checkpoint-inhibitor", "monoclonal-antibody"],
  ["checkpoint-inhibitor", "pdl1-expression"],
  ["pdl1-expression", "tps-cps"],
  ["pdl1-expression", "msi-h-dmmr"],
  ["msi-h-dmmr", "tmb-high"],
  ["msi-h-dmmr", "brca-status"],
  ["brca-status", "her2-status"],
  ["pdl1-expression", "nsclc"],
  ["checkpoint-inhibitor", "melanoma"],
  ["tnbc", "her2-status"],
  ["tnbc", "pdl1-expression"],
  ["colorectal-msi", "msi-h-dmmr"],
  ["ecog-ps", "organ-function"],
  ["ecog-ps", "prior-therapy-failure"],
  ["prior-therapy-failure", "washout-period"],
  ["pd1-blockade", "iraes"],
  ["iraes", "autoimmune-exclusion"],
  ["checkpoint-inhibitor", "tnbc"],
  ["nsclc", "pdl1-expression"],
];

export function getTrialKeywordsForPatient(patient: Patient | null): FdaKeyword[] {
  if (!patient) return keytrudaFdaKeywords;
  const rel = getPatientRelevantNodes(patient);
  return keytrudaFdaKeywords.filter((kw) => kw.relatedNodeIds.some((id) => rel.has(id)));
}

export function getVisibleKeywordEdges(keywordIds: Set<string>): [string, string][] {
  return TRIAL_KEYWORD_EDGES.filter(([a, b]) => keywordIds.has(a) && keywordIds.has(b));
}

const CATEGORY_ORDER: FdaKeyword["category"][] = [
  "Mechanism",
  "Biomarker",
  "Indication",
  "Clinical Status",
  "Adverse Events",
  "Dosing",
];

export interface KeywordLayoutPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Approximate wrapped height for a label at 12px in a fixed column width (matches canvas foreignObject). */
export function estimateKeywordNodeHeight(label: string, colW: number): number {
  const horizontalPad = 12;
  const verticalPad = 10;
  const lineHeight = 17;
  const minHeight = 36;
  const innerW = Math.max(72, colW - horizontalPad * 2);

  const words = label.trim().split(/\s+/);
  if (words.length === 0) return minHeight;

  const charW = 6.2;
  const spaceW = 3.5;

  let lineCount = 0;
  let lineWidth = 0;

  for (const word of words) {
    const wordW = word.length * charW;
    if (wordW > innerW) {
      if (lineWidth > 0) {
        lineCount++;
        lineWidth = 0;
      }
      lineCount += Math.ceil(wordW / innerW);
      continue;
    }
    const extra = lineWidth > 0 ? spaceW : 0;
    if (lineWidth + extra + wordW > innerW) {
      lineCount++;
      lineWidth = wordW;
    } else {
      lineWidth += extra + wordW;
    }
  }
  if (lineWidth > 0) lineCount++;

  lineCount = Math.max(1, lineCount);
  return Math.max(minHeight, verticalPad * 2 + lineCount * lineHeight);
}

const CAT_ORDER_IDX = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));

/** Stable order for rendering: category columns, then label A→Z within a column. */
export function sortTrialKeywordsForDisplay(keywords: FdaKeyword[]): FdaKeyword[] {
  return [...keywords].sort((a, b) => {
    const ca = CAT_ORDER_IDX.get(a.category) ?? 99;
    const cb = CAT_ORDER_IDX.get(b.category) ?? 99;
    if (ca !== cb) return ca - cb;
    return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
  });
}

/** Column headers for the keyword canvas (one per active category column). */
export interface CategoryColumnHeader {
  category: string;
  x: number;
  width: number;
  labelY: number;
}

export interface LayoutTrialKeywordsOptions {
  /**
   * When wider than the intrinsic layout, extra space is added between columns (same 168px nodes)
   * instead of scaling — keeps node and text size identical to a narrow / single-patient view.
   */
  targetWidth?: number;
}

export function layoutTrialKeywords(
  keywords: FdaKeyword[],
  options?: LayoutTrialKeywordsOptions
): {
  positions: Map<string, KeywordLayoutPos>;
  contentHeight: number;
  /** SVG width (matches targetWidth when expanded, else intrinsic minimum). */
  contentWidth: number;
  categoryHeaders: CategoryColumnHeader[];
} {
  const positions = new Map<string, KeywordLayoutPos>();
  const byCat = new Map<FdaKeyword["category"], FdaKeyword[]>();
  keywords.forEach((kw) => {
    const list = byCat.get(kw.category) ?? [];
    list.push(kw);
    byCat.set(kw.category, list);
  });

  const activeCats = [...byCat.keys()].sort(
    (a, b) => (CAT_ORDER_IDX.get(a) ?? 99) - (CAT_ORDER_IDX.get(b) ?? 99)
  );
  const n = activeCats.length;
  const colW = 168;
  /** Space between stacked pills in a column — wider than before so same-column edges read like the Wave grid. */
  const nodeGapY = 32;
  const headerH = 56;
  const basePadX = 32;
  /** Base gap — never compress columns into overlapping x ranges. */
  const baseGapX = n <= 1 ? 0 : 16;

  const intrinsicWidth = basePadX * 2 + n * colW + Math.max(0, n - 1) * baseGapX;

  let padX = basePadX;
  let gapX = baseGapX;
  const tw = options?.targetWidth;
  if (typeof tw === "number" && tw > 0 && tw > intrinsicWidth) {
    const extra = tw - intrinsicWidth;
    if (n > 1) {
      gapX = baseGapX + extra / (n - 1);
    } else if (n === 1) {
      padX = basePadX + extra / 2;
    }
  }

  const contentWidth = padX * 2 + n * colW + Math.max(0, n - 1) * gapX;

  const categoryHeaders: CategoryColumnHeader[] = [];
  const labelY = padX + 18;

  let maxBottom = 0;
  activeCats.forEach((cat, ci) => {
    const raw = byCat.get(cat) ?? [];
    const nodes = [...raw].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    byCat.set(cat, nodes);

    const x = padX + ci * (colW + gapX);
    categoryHeaders.push({ category: cat, x, width: colW, labelY });

    let y = padX + headerH;
    nodes.forEach((node) => {
      const h = estimateKeywordNodeHeight(node.label, colW);
      positions.set(node.id, { x, y, width: colW, height: h });
      maxBottom = Math.max(maxBottom, y + h);
      y += h + nodeGapY;
    });
  });

  return { positions, contentHeight: maxBottom + padX, contentWidth, categoryHeaders };
}
