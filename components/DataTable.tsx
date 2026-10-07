import { ArrowDown, ArrowDownUp, ArrowUp, ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { Filters, SalesRecord, SortKey } from "@/types/sales";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getRevenue } from "@/lib/analytics";

type DataTableProps = {
  records: SalesRecord[];
  printing: boolean;
  filters: Filters;
  categories: string[];
  customerTypes: string[];
  regions: string[];
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
  onFilterChange: (key: keyof Filters, value: string) => void;
  onSortChange: (key: SortKey) => void;
  onResetFilters: () => void;
};

const pageSize = 10;

export function DataTable({
  records,
  printing,
  filters,
  categories,
  customerTypes,
  regions,
  sortKey,
  sortDirection,
  onFilterChange,
  onSortChange,
  onResetFilters,
}: DataTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = records.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(records.length, safePage * pageSize);
  const visibleRecords = records.slice(start - 1, end);
  const tableRecords = printing ? records : visibleRecords;
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const invalidDateRange = Boolean(filters.startDate && filters.endDate && filters.startDate > filters.endDate);

  const activeFilters = useMemo(() => {
    const values = [
      filters.category,
      filters.region,
      filters.customerType,
      filters.query ? `검색: ${filters.query}` : "",
      filters.startDate ? `시작: ${filters.startDate}` : "",
      filters.endDate ? `종료: ${filters.endDate}` : "",
    ].filter(Boolean);

    return values.length ? values.join(" · ") : "전체 데이터 기준";
  }, [filters]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setPage(1);
    onFilterChange(key, value);
  };

  const resetFilters = () => {
    setPage(1);
    onResetFilters();
  };
  const changeSort = (key: SortKey) => {
    setPage(1);
    onSortChange(key);
  };

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-slate-950">원본 데이터 테이블</h2>
          <p className="mt-1 text-sm text-slate-500">
            {printing ? `필터 결과 전체 ${formatNumber(records.length)}개 표시` : `총 ${formatNumber(records.length)}개 중 ${formatNumber(start)}~${formatNumber(end)}개 표시`}
          </p>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="no-print inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={16} />
          필터 초기화
        </button>
      </div>

      <div className="no-print mt-4 break-keep rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
        적용된 필터: {activeFilters}
      </div>

      <div className="no-print mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(150px,1fr))_minmax(290px,1.4fr)]">
        <label className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            aria-label="상품명, 카테고리, 지역 검색"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder="상품명, 카테고리, 지역 검색"
            className="h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white pl-10 pr-4 text-sm"
          />
        </label>
        <Select value={filters.category} onChange={(value) => updateFilter("category", value)} options={categories} label="전체 카테고리" />
        <Select value={filters.customerType} onChange={(value) => updateFilter("customerType", value)} options={customerTypes} label="전체 고객 유형" />
        <Select value={filters.region} onChange={(value) => updateFilter("region", value)} options={regions} label="전체 지역" />
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-1">
          <input
            type="date"
            max={filters.endDate || undefined}
            aria-label="날짜 시작"
            value={filters.startDate}
            onChange={(event) => updateFilter("startDate", event.target.value)}
            className="h-11 min-w-0 rounded-xl border border-stone-300 bg-white px-3 text-sm sm:px-4"
          />
          <input
            type="date"
            min={filters.startDate || undefined}
            aria-label="날짜 종료"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
            className="h-11 min-w-0 rounded-xl border border-stone-300 bg-white px-3 text-sm sm:px-4"
          />
        </div>
      </div>
      {invalidDateRange && <p className="no-print mt-3 text-sm text-red-700" role="alert">종료 날짜는 시작 날짜보다 빠를 수 없습니다.</p>}
      <div className="no-print mt-4 flex items-center gap-2 sm:hidden">
        <select aria-label="정렬 기준" value={sortKey} onChange={(event) => changeSort(event.target.value as SortKey)} className="h-10 min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 text-sm">
          <option value="date">날짜순</option><option value="quantity">수량순</option><option value="revenue">매출순</option>
        </select>
        <button type="button" onClick={() => changeSort(sortKey)} aria-label={sortDirection === "asc" ? "오름차순, 내림차순으로 변경" : "내림차순, 오름차순으로 변경"} title={sortDirection === "asc" ? "내림차순으로 변경" : "오름차순으로 변경"} className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-stone-300 text-emerald-700">
          {sortDirection === "asc" ? <ArrowUp size={17} /> : <ArrowDown size={17} />}
        </button>
      </div>

      <div className="no-print mt-6 grid gap-3 sm:hidden">
        {visibleRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
            조건에 맞는 데이터가 없습니다. 필터를 변경해보세요.
          </div>
        ) : (
          visibleRecords.map((record) => (
            <article key={record.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-base font-bold text-slate-950">{record.product}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {record.date} · {record.category}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {record.customerType}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-stone-50 p-3">
                  <dt className="text-xs font-bold text-slate-500">매출</dt>
                  <dd className="mt-1 font-bold tabular-nums text-slate-950">{formatCurrency(getRevenue(record))}</dd>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <dt className="text-xs font-bold text-slate-500">가격 / 수량</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-slate-700">
                    {formatCurrency(record.price)} · {formatNumber(record.quantity)}개
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl bg-stone-50 p-3">
                  <dt className="text-xs font-bold text-slate-500">지역</dt>
                  <dd className="mt-1 font-semibold text-slate-700">{record.region}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

      <div className="print-table-container mt-6 hidden min-w-0 max-w-full overflow-hidden rounded-2xl border border-stone-200 sm:block">
        <div className="print-table-scroll w-full max-w-full overflow-x-auto" tabIndex={0} role="region" aria-label="매출 데이터 표">
          <table className="sales-table w-full min-w-[820px] border-collapse text-left text-[13px] sm:min-w-[960px]">
            <thead className="bg-stone-50 text-xs font-bold text-slate-600">
              <tr>
                <SortableTh label="날짜" active={sortKey === "date"} direction={sortDirection} onClick={() => changeSort("date")} />
                <th className="px-4 py-3">상품명</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3 text-right">가격</th>
                <SortableTh label="수량" active={sortKey === "quantity"} direction={sortDirection} onClick={() => changeSort("quantity")} align="right" />
                <SortableTh label="매출" active={sortKey === "revenue"} direction={sortDirection} onClick={() => changeSort("revenue")} align="right" />
                <th className="px-4 py-3">고객 유형</th>
                <th className="px-4 py-3">지역</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tableRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center font-semibold text-slate-500">
                    조건에 맞는 데이터가 없습니다. 필터를 변경해보세요.
                  </td>
                </tr>
              ) : (
                tableRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-emerald-50/40">
                    <td className="h-12 whitespace-nowrap px-4 py-3 font-semibold text-slate-800">{record.date}</td>
                    <td className="max-w-64 break-words px-4 py-3 text-slate-700">{record.product}</td>
                    <td className="max-w-48 break-words px-4 py-3 text-slate-700">{record.category}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">{formatCurrency(record.price)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(record.quantity)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums text-slate-950">{formatCurrency(getRevenue(record))}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex whitespace-nowrap rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {record.customerType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{record.region}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="no-print mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {formatNumber(safePage)} / {formatNumber(totalPages)} 페이지
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <PaginationButton disabled={safePage <= 1} onClick={() => setPage(Math.max(1, safePage - 1))}>
            <ChevronLeft size={16} />
            이전
          </PaginationButton>
          <PaginationButton disabled={safePage >= totalPages} onClick={() => setPage(Math.min(totalPages, safePage + 1))}>
            다음
            <ChevronRight size={16} />
          </PaginationButton>
        </div>
      </div>
    </section>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 min-w-0 rounded-xl border border-stone-300 bg-white px-4 text-sm"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function SortableTh({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th aria-sort={active ? direction === "asc" ? "ascending" : "descending" : "none"} className={`px-4 py-3 ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 font-bold text-slate-600 hover:text-emerald-700 ${align === "right" ? "justify-end" : ""}`}
      >
        {label}
        {active ? direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} /> : <ArrowDownUp size={13} />}
        <span className="sr-only">{active ? direction === "asc" ? "오름차순" : "내림차순" : "정렬"}</span>
      </button>
    </th>
  );
}

function PaginationButton({ children, disabled, onClick }: { children: ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-slate-400 disabled:opacity-70"
    >
      {children}
    </button>
  );
}
