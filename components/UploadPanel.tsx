import { FileSpreadsheet, FileUp, LoaderCircle, RotateCcw, Upload } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";

type UploadPanelProps = {
  fileName?: string;
  recordCount: number;
  sourceLabel: string;
  error?: string;
  isReading: boolean;
  onFile: (file: File) => void;
  onSample: () => void;
  onReset: () => void;
};

export function UploadPanel({ fileName, recordCount, sourceLabel, error, isReading, onFile, onSample, onReset }: UploadPanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (isReading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <section id="upload-panel" className="no-print min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <label
          htmlFor={inputId}
          role="button"
          aria-label={isReading ? "CSV 파일 읽는 중" : "CSV 파일 선택 또는 드래그 앤 드롭"}
          aria-disabled={isReading}
          tabIndex={isReading ? -1 : 0}
          onKeyDown={(event) => {
            if (!isReading && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!isReading && event.dataTransfer.types.includes("Files")) {
              dragDepth.current += 1;
              setDragging(true);
            }
          }}
          onDragLeave={() => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (!dragDepth.current) setDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={`upload-dropzone flex min-h-56 min-w-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition sm:p-6 ${isReading ? "cursor-wait border-emerald-200 bg-emerald-50/50" : dragging ? "cursor-copy border-emerald-500 bg-emerald-100/60" : "cursor-pointer border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50"}`}
        >
          {isReading ? <LoaderCircle className="animate-spin text-emerald-700" size={34} /> : <Upload className="text-emerald-700" size={34} />}
          <span className="mt-4 text-lg font-bold text-slate-950">{isReading ? "CSV 파일을 읽고 있습니다" : dragging ? "여기에 파일을 놓으세요" : "CSV 파일을 업로드하세요"}</span>
          <span className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
            date, product, category, price, quantity, customerType, region 컬럼을 포함한 CSV 파일을 지원합니다.
          </span>
          <span className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white">
            <FileUp size={17} />
            {isReading ? "읽는 중" : "파일 선택"}
          </span>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            disabled={isReading}
            tabIndex={-1}
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.currentTarget.value = "";
            }}
          />
          <span className="mt-3 text-xs text-slate-500">UTF-8 CSV · 최대 10MB / 50,000행</span>
        </label>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-emerald-700 shadow-sm">
              <FileSpreadsheet size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-950">업로드 상태</h2>
              <p role="status" aria-live="polite" className="mt-1 inline-flex max-w-full rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="truncate">{sourceLabel}</span>
              </p>
            </div>
          </div>
          <dl className="mt-5 grid min-w-0 gap-3">
            <div className="flex min-w-0 flex-col items-start gap-1 rounded-xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <dt className="shrink-0 text-sm font-semibold text-slate-500">파일명</dt>
              <dd className="min-w-0 flex-1 break-all text-left text-sm font-bold text-slate-900 sm:text-right">
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
            <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
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
