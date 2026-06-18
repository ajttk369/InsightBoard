import { BarChart3, Database, FileUp } from "lucide-react";

type HeroProps = {
  onSample: () => void;
  onUploadFocus: () => void;
};

const previewMetrics = [
  ["총 매출", "824만원"],
  ["주문 수", "64건"],
  ["상위 카테고리", "잡화"],
  ["재구매 비율", "42%"],
];

export function Hero({ onSample, onUploadFocus }: HeroProps) {
  return (
    <section className="grid min-w-0 gap-7 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)] lg:items-center">
      <div className="min-w-0">
        <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
          <Database size={16} />
          <span className="truncate">CSV 매출 분석 서비스</span>
        </div>
        <h1 className="text-[34px] font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl">InsightBoard</h1>
        <p className="mt-5 max-w-[21rem] break-keep text-[17px] font-semibold leading-7 text-slate-800 sm:max-w-2xl sm:text-xl sm:leading-8">
          CSV 데이터를 실무형 대시보드로 바꾸는 매출 분석 서비스
        </p>
        <p className="mt-3 max-w-[22rem] break-keep text-[15px] leading-7 text-slate-600 sm:max-w-3xl sm:text-base">
          CSV 파일을 올리면 매출 흐름, 고객 유형, 카테고리 성과, 지역별 매출을 같은 기준으로 집계하고 차트와 테이블로 확인할 수 있습니다.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onSample}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-700 sm:text-base"
          >
            <BarChart3 size={18} />
            샘플 데이터로 체험하기
          </button>
          <button
            type="button"
            onClick={onUploadFocus}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-emerald-300 hover:text-emerald-700 sm:text-base"
          >
            <FileUp size={18} />
            CSV 업로드하기
          </button>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl shadow-stone-300/40 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500">최근 업로드 데이터 기준</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">대시보드 미리보기</h2>
          </div>
          <div className="w-fit whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">분석 완료</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
          {previewMetrics.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-xl border border-stone-100 bg-stone-50 p-3 sm:p-4">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-2 break-keep text-[19px] font-bold leading-tight text-slate-950 sm:text-2xl">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 h-28 rounded-xl border border-stone-100 bg-gradient-to-b from-white to-emerald-50 p-3 sm:mt-6 sm:h-36 sm:p-4">
          <div className="flex h-full items-end gap-2">
            {[42, 58, 44, 72, 68, 90, 76, 95, 88].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-md"
                style={{
                  height: `${height}%`,
                  backgroundColor: ["#10B981", "#14B8A6", "#84CC16", "#F59E0B"][index % 4],
                  opacity: 0.5 + index * 0.04,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
