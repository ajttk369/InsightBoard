import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description: string;
  empty?: boolean;
  children: ReactNode;
};

export function ChartCard({ title, description, empty, children }: ChartCardProps) {
  return (
    <article className="print-section min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-2 text-[13px] leading-6 text-slate-600">{description}</p>
      </div>
      {empty ? (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm font-semibold text-slate-500">
          표시할 데이터가 없습니다.
        </div>
      ) : (
        <div className="h-72 min-w-0">{children}</div>
      )}
    </article>
  );
}
