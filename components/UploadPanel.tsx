import { FileSpreadsheet, FileUp, RotateCcw, Upload } from "lucide-react";

type UploadPanelProps = {
  fileName?: string;
  recordCount: number;
  sourceLabel: string;
  error?: string;
  onFile: (file: File) => void;
  onSample: () => void;
  onReset: () => void;
};

export function UploadPanel({ fileName, recordCount, sourceLabel, error, onFile, onSample, onReset }: UploadPanelProps) {
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <section id="upload-panel" className="no-print min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <label
          tabIndex={0}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="flex min-h-56 min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50 sm:p-6"
        >
          <Upload className="text-emerald-700" size={34} />
          <span className="mt-4 text-lg font-bold text-slate-950">CSV 파일을 업로드하세요</span>
          <span className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
            date, product, category, price, quantity, customerType, region 컬럼을 포함한 CSV 파일을 지원합니다.
          </span>
          <span className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white">
            <FileUp size={17} />
            파일 선택
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.currentTarget.value = "";
            }}
          />
        </label>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-emerald-700 shadow-sm">
              <FileSpreadsheet size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-950">업로드 상태</h2>
              <p className="mt-1 inline-flex max-w-full rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="truncate">{sourceLabel}</span>
              </p>
            </div>
          </div>
          <dl className="mt-5 grid min-w-0 gap-3">
            <div className="flex min-w-0 flex-col items-start gap-1 rounded-xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <dt className="text-sm font-semibold text-slate-500">파일명</dt>
              <dd className="w-full min-w-0 break-all text-left text-sm font-bold text-slate-900 sm:text-right">
                {fileName ?? "선택된 파일 없음"}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col items-start gap-1 rounded-xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <dt className="text-sm font-semibold text-slate-500">데이터 행 수</dt>
              <dd className="text-sm font-bold text-slate-900">{recordCount}</dd>
            </div>
            <div className="min-w-0 rounded-xl bg-white px-4 py-3">
              <dt className="text-sm font-semibold text-slate-500">분석 컬럼</dt>
              <dd className="mt-2 max-w-full break-words text-[11px] leading-5 text-slate-600 sm:text-xs">
                date, product, category, price, quantity, customerType, region
              </dd>
            </div>
          </dl>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onSample}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <FileSpreadsheet size={17} />
              샘플 데이터로 체험하기
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <RotateCcw size={17} />
              데이터 초기화
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
