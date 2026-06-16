import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: "emerald" | "mint" | "lime" | "amber";
};

const accentClass = {
  emerald: "bg-emerald-50 text-emerald-700",
  mint: "bg-teal-50 text-teal-700",
  lime: "bg-lime-50 text-lime-700",
  amber: "bg-amber-50 text-amber-700",
};

export function KpiCard({ title, value, detail, icon: Icon, accent = "emerald" }: KpiCardProps) {
  return (
    <article className="print-section rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${accentClass[accent]}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}
