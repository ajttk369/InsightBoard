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
    <section id="upload-panel" className="no-print rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <label
          tabIndex={0}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
        >
          <Upload className="text-emerald-700" size={34} />
          <span className="mt-4 text-lg font-bold text-slate-950">CSV 파일을 업로드하세요</span>
          <span className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
            date, product, category, price, quantity, customerType, region 컬럼을 포함한 CSV 파일을 지원합니다.
          </span>
          <span className="mt-5 inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-4 font-semibold text-white">
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

        <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-emerald-700 shadow-sm">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">업로드 상태</h2>
              <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{sourceLabel}</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-3">
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
              <dt className="text-sm font-semibold text-slate-500">파일명</dt>
              <dd className="max-w-44 truncate text-sm font-bold text-slate-900">{fileName ?? "선택된 파일 없음"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
              <dt className="text-sm font-semibold text-slate-500">데이터 행 수</dt>
              <dd className="text-sm font-bold text-slate-900">{recordCount}</dd>
            </div>
            <div className="rounded-xl bg-white px-4 py-3">
              <dt className="text-sm font-semibold text-slate-500">분석 컬럼</dt>
              <dd className="mt-2 overflow-x-auto whitespace-nowrap text-xs text-slate-600">
                date, product, category, price, quantity, customerType, region
              </dd>
            </div>
          </dl>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSample}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <FileSpreadsheet size={17} />
              샘플 데이터로 체험하기
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700"
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
