import { AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import type { Insight } from "@/types/sales";

const toneMap = {
  positive: {
    icon: TrendingUp,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "확인",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-700",
    label: "주의",
  },
  suggestion: {
    icon: Lightbulb,
    className: "border-teal-200 bg-teal-50 text-teal-700",
    label: "검토",
  },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const tone = toneMap[insight.tone];
  const Icon = tone.icon;

  return (
    <article className="print-section min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${tone.className}`}>
          <Icon size={14} />
          {tone.label}
        </div>
        <span className="max-w-full rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-slate-600">{insight.tag}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{insight.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{insight.body}</p>
    </article>
  );
}
