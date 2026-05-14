import type { Patient } from './patients';

/** Returns the set of medicalData node IDs that are relevant for a given patient. */
export function getPatientRelevantNodes(patient: Patient): Set<string> {
  const ids = new Set<string>();
  const dx = patient.diagnoses.join(' ').toLowerCase();
  const meds = patient.medications.join(' ').toLowerCase();
  const appts = patient.upcomingAppointments.map((a) => a.type.toLowerCase()).join(' ');

  // Always relevant to every patient
  ids.add('pd-1'); // Medical History
  ids.add('pd-4'); // Lab Results
  ids.add('pd-6'); // Demographics
  ids.add('sub-8'); // Current Status
  ids.add('spec-8'); // Recent Labs
  ids.add('spec-9'); // Tumor Markers
  ids.add('mon-1'); // Lab Monitoring
  ids.add('mon-4'); // Follow-up Care

  // Any cancer type
  if (
    dx.includes('cancer') || dx.includes('lymphoma') ||
    dx.includes('myeloma') || dx.includes('melanoma') ||
    dx.includes('leukemia') || dx.includes('carcinoma')
  ) {
    ids.add('sub-1');
    ids.add('sub-7');
  }

  // Stage information
  if (dx.includes('stage')) {
    ids.add('sub-2');
    ids.add('spec-1');
  }

  // Comorbidities
  if (
    dx.includes('hypertension') || dx.includes('diabetes') || dx.includes('copd') ||
    dx.includes('atrial') || dx.includes('kidney') || dx.includes('osteoporosis') ||
    dx.includes('anxiety') || dx.includes('hypothyroid') || dx.includes('renal')
  ) {
    ids.add('pd-5');
    ids.add('spec-3');
  }

  // Genetic / family history
  if (
    dx.includes('brca') || dx.includes('her2') || dx.includes('genetic') ||
    dx.includes('hereditary') || meds.includes('olaparib')
  ) {
    ids.add('sub-3');
    ids.add('spec-2');
    ids.add('biom-2');
    ids.add('pd-2');
  }

  // Breast cancer biomarkers
  if (
    dx.includes('breast') || dx.includes('hormone receptor') ||
    dx.includes('er+') || dx.includes('pr+') || dx.includes('tamoxifen') ||
    meds.includes('tamoxifen') || meds.includes('letrozole') || meds.includes('anastrozole')
  ) {
    ids.add('biom-1');
    ids.add('biom-5');
    ids.add('spec-7');
  }

  // HER2
  if (dx.includes('her2') || meds.includes('trastuzumab') || meds.includes('pertuzumab')) {
    ids.add('biom-3');
  }

  // PD-L1 / immunotherapy biomarkers
  if (
    meds.includes('pembrolizumab') || meds.includes('nivolumab') ||
    meds.includes('ipilimumab') || meds.includes('atezolizumab')
  ) {
    ids.add('biom-4');
  }

  // Chemotherapy
  if (
    meds.includes('carboplatin') || meds.includes('paclitaxel') || meds.includes('doxorubicin') ||
    meds.includes('cyclophosphamide') || meds.includes('folfox') || meds.includes('gemcitabine') ||
    meds.includes('nab-paclitaxel') || meds.includes('abvd') || meds.includes('lenalidomide') ||
    meds.includes('bortezomib') || meds.includes('cisplatin') || meds.includes('etoposide') ||
    meds.includes('docetaxel') || meds.includes('iv') || meds.includes('regimen') ||
    meds.includes('sacituzumab') || meds.includes('filgrastim') || meds.includes('pegfilgrastim') ||
    appts.includes('chemotherapy') || appts.includes('infusion') || appts.includes('cycle')
  ) {
    ids.add('treat-1');
    ids.add('sub-4');
    ids.add('spec-4');
    ids.add('pd-3');
  }

  // Hormone therapy
  if (
    meds.includes('tamoxifen') || meds.includes('letrozole') || meds.includes('anastrozole') ||
    meds.includes('megestrol') || meds.includes('fulvestrant')
  ) {
    ids.add('treat-4');
    ids.add('spec-7');
    ids.add('biom-1');
  }

  // Targeted therapy
  if (
    meds.includes('trastuzumab') || meds.includes('pertuzumab') || meds.includes('bevacizumab') ||
    meds.includes('sunitinib') || meds.includes('imatinib') || meds.includes('erlotinib') ||
    meds.includes('osimertinib') || meds.includes('olaparib') || meds.includes('ribociclib') ||
    meds.includes('palbociclib') || meds.includes('apixaban')
  ) {
    ids.add('treat-5');
    ids.add('biom-3');
  }

  // Immunotherapy
  if (
    meds.includes('pembrolizumab') || meds.includes('nivolumab') ||
    meds.includes('ipilimumab') || meds.includes('atezolizumab') || meds.includes('durvalumab')
  ) {
    ids.add('treat-6');
    ids.add('biom-4');
  }

  // Surgery
  if (
    appts.includes('surgery') || appts.includes('lumpectomy') || appts.includes('mastectomy') ||
    appts.includes('operation') || appts.includes('resection') || appts.includes('biopsy')
  ) {
    ids.add('treat-2');
    ids.add('sub-5');
    ids.add('spec-5');
  }

  // Radiation
  if (appts.includes('radiation') || appts.includes('radiotherapy') || dx.includes('radiation')) {
    ids.add('treat-3');
    ids.add('sub-6');
    ids.add('spec-6');
  }

  // Imaging
  if (
    appts.includes('scan') || appts.includes('mri') || appts.includes('pet') ||
    appts.includes('ct') || appts.includes('imaging') || appts.includes('ultrasound') ||
    appts.includes('mammogram') || appts.includes('echocardiogram') || appts.includes('dexa') ||
    appts.includes('x-ray')
  ) {
    ids.add('mon-2');
  }

  // Clinical trials / infusions
  if (appts.includes('trial') || appts.includes('immunotherapy infusion') || appts.includes('targeted therapy infusion')) {
    ids.add('mon-3');
  }

  return ids;
}
