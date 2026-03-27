export interface GraphNode {
  id: string;
  label: string;
  connections: string[];
}

export interface GraphColumn {
  title: string;
  count: number;
  nodes: GraphNode[];
}

export const medicalData: GraphColumn[] = [
  {
    title: 'Patient Data',
    count: 6,
    nodes: [
      { id: 'pd-1', label: 'Medical History', connections: ['sub-1', 'sub-2'] },
      { id: 'pd-2', label: 'Family History', connections: ['sub-3'] },
      { id: 'pd-3', label: 'Treatment History', connections: ['sub-4', 'sub-5', 'sub-6'] },
      { id: 'pd-4', label: 'Lab Results', connections: ['spec-8'] },
      { id: 'pd-5', label: 'Comorbidities', connections: ['spec-3'] },
      { id: 'pd-6', label: 'Demographics', connections: [] },
    ],
  },
  {
    title: 'Categories',
    count: 8,
    nodes: [
      { id: 'sub-1', label: 'Cancer Diagnosis', connections: ['spec-1', 'spec-2'] },
      { id: 'sub-2', label: 'Stage Information', connections: ['spec-1'] },
      { id: 'sub-3', label: 'Genetic Markers', connections: ['spec-2', 'biom-2'] },
      { id: 'sub-4', label: 'Prior Chemotherapy', connections: ['spec-4'] },
      { id: 'sub-5', label: 'Prior Surgery', connections: ['spec-5'] },
      { id: 'sub-6', label: 'Prior Radiation', connections: ['spec-6'] },
      { id: 'sub-7', label: 'Cancer Types', connections: ['spec-1'] },
      { id: 'sub-8', label: 'Current Status', connections: [] },
    ],
  },
  {
    title: 'Specifics',
    count: 9,
    nodes: [
      { id: 'spec-1', label: 'Stage II Breast Cancer', connections: ['treat-1', 'treat-2'] },
      { id: 'spec-2', label: 'BRCA Negative', connections: ['biom-2'] },
      { id: 'spec-3', label: 'Hypertension', connections: ['mon-3'] },
      { id: 'spec-4', label: 'AC-T Chemotherapy', connections: ['treat-1'] },
      { id: 'spec-5', label: 'Lumpectomy', connections: ['treat-2'] },
      { id: 'spec-6', label: 'Radiation Complete', connections: ['treat-3'] },
      { id: 'spec-7', label: 'Hormone Receptor +', connections: ['biom-1'] },
      { id: 'spec-8', label: 'Recent Labs', connections: ['mon-1'] },
      { id: 'spec-9', label: 'Tumor Markers', connections: ['biom-3'] },
    ],
  },
  {
    title: 'Treatments',
    count: 6,
    nodes: [
      { id: 'treat-1', label: 'Chemotherapy', connections: ['biom-1', 'mon-1'] },
      { id: 'treat-2', label: 'Surgery', connections: ['mon-2'] },
      { id: 'treat-3', label: 'Radiation', connections: ['mon-1', 'mon-2'] },
      { id: 'treat-4', label: 'Hormone Therapy', connections: ['biom-1'] },
      { id: 'treat-5', label: 'Targeted Therapy', connections: ['biom-3'] },
      { id: 'treat-6', label: 'Immunotherapy', connections: ['mon-3'] },
    ],
  },
  {
    title: 'Biomarkers',
    count: 5,
    nodes: [
      { id: 'biom-1', label: 'ER+/PR+ HER2-', connections: ['mon-1'] },
      { id: 'biom-2', label: 'BRCA Negative', connections: ['mon-2'] },
      { id: 'biom-3', label: 'Ki-67 Index', connections: ['mon-1'] },
      { id: 'biom-4', label: 'PD-L1 Status', connections: [] },
      { id: 'biom-5', label: 'Oncotype Score', connections: ['mon-1'] },
    ],
  },
  {
    title: 'Monitoring',
    count: 4,
    nodes: [
      { id: 'mon-1', label: 'Lab Monitoring', connections: [] },
      { id: 'mon-2', label: 'Imaging Studies', connections: [] },
      { id: 'mon-3', label: 'Clinical Trials', connections: [] },
      { id: 'mon-4', label: 'Follow-up Care', connections: [] },
    ],
  },
];
