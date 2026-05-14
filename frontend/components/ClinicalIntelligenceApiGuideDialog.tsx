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
            <DialogTitle className="text-left text-base leading-snug">
              Clinical Intelligence API: Frontend Integration Guide
            </DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm text-gray-600">
            This is the same integration reference used for the Longitudinal + RAG stack. Open it anytime via{" "}
            <strong className="font-medium text-gray-800">API guide</strong> in the Discovery header (next to Ask AI).
            This dashboard maps cohort ids (e.g. <code className="text-xs bg-slate-100 px-1 rounded">p-1</code> →
            backend patient <code className="text-xs bg-slate-100 px-1 rounded">1</code>). Override the base URL with{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">VITE_CLINICAL_INTELLIGENCE_URL</code> (e.g. on Vercel).
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-1 space-y-6 text-sm text-gray-800">
          <section>
            <h3 className="font-semibold text-gray-900">1. Overview</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              This backend transforms 20+ years of unstructured patient records (PDFs) into a structured, queryable
              Longitudinal Patient Record. It uses a persistent SQLite store for local context and an OpenSearch-backed RAG
              engine for global medical research synthesis (including searches across tens of millions of indexed records).
            </p>
            <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-1">
              <li>
                Base URL (this build):{" "}
                <a className="text-indigo-600 underline break-all" href={baseUrl} target="_blank" rel="noopener noreferrer">
                  {baseUrl}
                </a>
              </li>
              <li>Protocol: REST (JSON)</li>
              <li>CORS enabled (typical demo hosts include localhost and Hugging Face; your deploy may add Vercel origins on the server).</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">2. Core endpoints</h3>

            <h4 className="mt-4 text-[13px] font-medium text-gray-800">A. Get patient timeline — GET</h4>
            <p className="text-gray-600 mt-1">
              Use this to build the vertical timeline in the left sidebar. Every medical encounter, newest → oldest. Example:{" "}
              <code className="bg-slate-100 px-1 rounded">GET {baseUrl}/patient/1/timeline</code>
            </p>
            <Code>{`{
  "patient_name": "Laura Lehmann",
  "total_records": 39,
  "timeline": [
    {
      "filename": "10-15-2024.pdf",
      "doc_date": "2024-10-15",
      "snippet": "Follow up visit for ALCL management. Patient feels well..."
    },
    {
      "filename": "01-10-2017.pdf",
      "doc_date": "2017-01-10",
      "snippet": "Lab results for Inhibin B and AMH levels..."
    }
  ]
}`}</Code>

            <h4 className="mt-6 text-[13px] font-medium text-gray-800">B. Integrated RAG chat — POST</h4>
            <p className="text-gray-600 mt-1">
              The “Intelligence” engine: question in, longitudinal context + PubMed-backed synthesis out. Endpoint:{" "}
              <code className="bg-slate-100 px-1 rounded">POST {baseUrl || "…"}/chat</code>
            </p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Request body</p>
            <Code>{`{
  "patient_id": 1,
  "user_query": "Explain the connection between her 2005 BEAM protocol and her 2017 hormone levels."
}`}</Code>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Response format</p>
            <Code>{`{
  "ai_analysis": "Based on the records, the patient underwent BEAM conditioning in 2005 [1]. This protocol is significantly gonadotoxic, which explains the undetectable AMH levels recorded in 2017 [2]...",
  "references": [
    {
      "title": "Late effects of BEAM conditioning on ovarian reserve",
      "pmid": "123456",
      "journal": "Journal of Clinical Oncology",
      "link": "https://pubmed.ncbi.nlm.nih.gov/123456/"
    }
  ],
  "status": "success"
}`}</Code>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">3. Safety guardrails (important)</h3>
            <p className="mt-2 text-gray-600">
              Deterministic safety layer: blocked keywords in <code className="bg-slate-100 px-1 rounded">user_query</code>{" "}
              include <strong className="font-medium text-gray-800">leukemia</strong>,{" "}
              <strong className="font-medium text-gray-800">terminal</strong>, <strong className="font-medium text-gray-800">death</strong>. The API then returns{" "}
              <code className="bg-slate-100 px-1 rounded">ai_analysis: &quot;AI will not give you response like that.&quot;</code>{" "}
              and <code className="bg-slate-100 px-1 rounded">&quot;status&quot;: &quot;blocked&quot;</code>. Recommended: show that
              state in a distinct color (e.g. orange).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">4. Integration tips for the “wow” factor</h3>
            <ul className="mt-2 list-disc pl-5 text-gray-600 space-y-1">
              <li>Sidebar: group by year from doc_date (“2024 (2 records)”).</li>
              <li>Evidence cards: map references to linked PubMed tiles under the synthesis.</li>
              <li>
                Loading: synthesis can take 5–15 seconds (high-density search). Use a clear “Analyzing longitudinal data…”
                state on the spinner.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900">5. Quick test (JavaScript / fetch)</h3>
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
