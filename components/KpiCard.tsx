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
    <article className="kpi-card print-section flex min-w-0 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p title={value} className={`kpi-value mt-3 font-bold tabular-nums text-slate-950 ${value.length > 18 ? "text-xl" : "text-2xl"}`}>{value}</p>
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${accentClass[accent]}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-auto pt-5 text-[13px] leading-6 text-slate-600">{detail}</p>
    </article>
  );
}
