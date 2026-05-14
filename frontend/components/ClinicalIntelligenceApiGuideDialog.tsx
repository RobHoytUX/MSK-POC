import { BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { getClinicalIntelligenceBaseUrl } from "../lib/clinicalIntelligence";

interface ClinicalIntelligenceApiGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 mb-4 p-3 rounded-lg bg-slate-900 text-slate-50 text-[11px] overflow-x-auto leading-relaxed whitespace-pre-wrap">
      {children}
    </pre>
  );
}

export default function ClinicalIntelligenceApiGuideDialog({
  open,
  onOpenChange,
}: ClinicalIntelligenceApiGuideDialogProps) {
  const baseUrl = open ? getClinicalIntelligenceBaseUrl() : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(920px,calc(100vw-2rem))] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <DialogTitle className="text-left">Clinical Intelligence API</DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm text-gray-600">
            Frontend integration overview. This dashboard calls the live endpoints when a patient id maps to a backend
            id (for example cohort id <code className="text-xs bg-slate-100 px-1 rounded">p-1</code> → patient{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">1</code>). Override base URL with{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">VITE_CLINICAL_INTELLIGENCE_URL</code>.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-1 space-y-6 text-sm text-gray-800">
          <section>
            <h3 className="font-semibold text-gray-900">1. Overview</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              Structured longitudinal patient records from decades of unstructured documents, SQLite for local context,
              and OpenSearch-backed RAG for research synthesis.
            </p>
            <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-1">
              <li>
                Current base URL in this bundle:{" "}
                <a className="text-indigo-600 underline break-all" href={baseUrl} target="_blank" rel="noopener noreferrer">
                  {baseUrl}
                </a>
              </li>
              <li>Protocol: REST (JSON)</li>
              <li>CORS enabled for localhost and Hugging Face frontends.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">2. Core endpoints</h3>

            <h4 className="mt-4 text-[13px] font-medium text-gray-800">A. Patient timeline — GET</h4>
            <p className="text-gray-600 mt-1">
              Vertical sidebar; encounters newest → oldest at <code className="bg-slate-100 px-1 rounded">GET /patient/1/timeline</code>.
            </p>
            <Code>{`{
  "patient_name": "Laura Lehmann",
  "total_records": 39,
  "timeline": [
    {
      "filename": "10-15-2024.pdf",
      "doc_date": "2024-10-15",
      "snippet": "Follow up visit for ALCL management. Patient feels well..."
    }
  ]
}`}</Code>

            <h4 className="mt-6 text-[13px] font-medium text-gray-800">B. RAG chat — POST</h4>
            <p className="text-gray-600 mt-1">
              Integrated RAG at{" "}
              <code className="bg-slate-100 px-1 rounded">POST ${baseUrl || "..."}/chat</code> — injects longitudinal
              context automatically.
            </p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Request body</p>
            <Code>{`{
  "patient_id": 1,
  "user_query": "Explain the connection between her 2005 BEAM protocol and her 2017 hormone levels."
}`}</Code>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Response shape</p>
            <Code>{`{
  "ai_analysis": "Based on the records...",
  "references": [
    {
      "title": "...",
      "pmid": "123456",
      "journal": "Journal of Clinical Oncology",
      "link": "https://pubmed.ncbi.nlm.nih.gov/123456/"
    }
  ],
  "status": "success"
}`}</Code>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">3. Safety guardrails</h3>
            <p className="mt-2 text-gray-600">
              Blocked keywords in <code className="bg-slate-100 px-1 rounded">user_query</code> (such as leukemia, terminal,
              death): API returns refusal copy and{" "}
              <code className="bg-slate-100 px-1 rounded">&quot;status&quot;: &quot;blocked&quot;</code>. UI shows amber styling.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">4. UI patterns</h3>
            <ul className="mt-2 list-disc pl-5 text-gray-600 space-y-1">
              <li>Sidebar: group by year from doc_date (“2024 (2 records)”).</li>
              <li>Evidence cards: map references to linked PubMed tiles under the synthesis.</li>
              <li>Loading: RAG runs 5–15s — show “Analyzing longitudinal data…” under the spinner.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">5. Quick test (fetch)</h3>
            <Code>{`const askClinicalAI = async (query) => {
  const response = await fetch('${baseUrl}/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_query: query, patient_id: 1 }),
  });
  const data = await response.json();
  console.log(data.ai_analysis);
};`}</Code>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
