"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Boxes, Download, Package, Printer, ReceiptText, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { Hero } from "@/components/Hero";
import { InsightCard } from "@/components/InsightCard";
import { KpiCard } from "@/components/KpiCard";
import { ProjectOverview } from "@/components/ProjectOverview";
import { UploadPanel } from "@/components/UploadPanel";
import { buildAnalytics, buildInsights, getRevenue } from "@/lib/analytics";
import { MAX_CSV_BYTES, parseSalesCsv, recordsToCsv } from "@/lib/csv";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { sampleData } from "@/lib/sampleData";
import type { DashboardSource, Filters, SalesRecord, SortKey } from "@/types/sales";

const emptyFilters: Filters = {
  query: "",
  category: "",
  customerType: "",
  region: "",
  startDate: "",
  endDate: "",
};

const chartColors = ["#10B981", "#14B8A6", "#84CC16", "#F59E0B", "#F97316", "#0F766E", "#65A30D"];

export default function Home() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [source, setSource] = useState<DashboardSource>("empty");
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string>();
  const [isReading, setReading] = useState(false);
  const [isPrinting, setPrinting] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const uploadRef = useRef<HTMLDivElement>(null);
  const readingRequest = useRef(0);

  useEffect(() => {
    const beforePrint = () => flushSync(() => setPrinting(true));
    const afterPrint = () => setPrinting(false);
    const preventFileNavigation = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    window.addEventListener("dragover", preventFileNavigation);
    window.addEventListener("drop", preventFileNavigation);
    return () => {
      readingRequest.current += 1;
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      window.removeEventListener("dragover", preventFileNavigation);
      window.removeEventListener("drop", preventFileNavigation);
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const filtered = records.filter((record) => {
      const matchesQuery =
        !query ||
        [record.product, record.category, record.region, record.customerType].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesCategory = !filters.category || record.category === filters.category;
      const matchesCustomer = !filters.customerType || record.customerType === filters.customerType;
      const matchesRegion = !filters.region || record.region === filters.region;
      const matchesStart = !filters.startDate || record.date >= filters.startDate;
      const matchesEnd = !filters.endDate || record.date <= filters.endDate;

      return matchesQuery && matchesCategory && matchesCustomer && matchesRegion && matchesStart && matchesEnd;
    });

    return filtered.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortKey === "date") return a.date.localeCompare(b.date) * direction;
      if (sortKey === "quantity") return (a.quantity - b.quantity) * direction;
      return (getRevenue(a) - getRevenue(b)) * direction;
    });
  }, [filters, records, sortDirection, sortKey]);

  const analytics = useMemo(() => buildAnalytics(filteredRecords), [filteredRecords]);
  const categoryChartData = useMemo(() => compactChartGroups(analytics.categoryRevenue, 8), [analytics.categoryRevenue]);
  const regionChartData = useMemo(() => compactChartGroups(analytics.regionRevenue, 10), [analytics.regionRevenue]);
  const insights = useMemo(() => buildInsights(filteredRecords, analytics), [filteredRecords, analytics]);
  const categories = useMemo(() => unique(records.map((record) => record.category)), [records]);
  const customerTypes = useMemo(() => unique(records.map((record) => record.customerType)), [records]);
  const regions = useMemo(() => unique(records.map((record) => record.region)), [records]);

  const hasData = records.length > 0;
  const hasFilteredData = filteredRecords.length > 0;
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const sourceLabel = isReading ? "새 CSV 파일을 읽는 중" :
    source === "sample" ? "샘플 데이터 사용 중" : source === "upload" ? "CSV 업로드 완료" : "아직 데이터가 없습니다";
  const filterBasisLabel = hasActiveFilters ? "필터 적용 데이터 기준" : "전체 데이터 기준";

  const newCustomerCount = filteredRecords.filter((record) => record.customerType === "신규").length;
  const returningCustomerCount = filteredRecords.filter((record) => record.customerType === "재구매").length;
  const newCustomerRate = filteredRecords.length ? (newCustomerCount / filteredRecords.length) * 100 : 0;
  const returningCustomerRate = filteredRecords.length ? (returningCustomerCount / filteredRecords.length) * 100 : 0;

  const primaryKpis = [
    { title: "총 매출", value: formatCurrency(analytics.totalRevenue), detail: "필터 기준 누적 매출", icon: TrendingUp },
    { title: "총 주문 수", value: formatNumber(analytics.totalOrders), detail: "CSV 1행을 주문 1건으로 집계", icon: ShoppingCart, accent: "mint" as const },
    { title: "총 판매 수량", value: formatNumber(analytics.totalQuantity), detail: "판매된 상품 수량 합계", icon: Boxes, accent: "lime" as const },
    { title: "평균 주문 금액", value: formatCurrency(analytics.averageOrderValue), detail: "주문 1건당 평균 매출", icon: ReceiptText, accent: "amber" as const },
  ];

  const secondaryKpis = [
    { title: "최고 판매 상품", value: analytics.topProduct, detail: "판매 수량 기준 상위 상품", icon: Package, accent: "mint" as const },
    { title: "최고 매출 지역", value: analytics.topRegion, detail: "매출 합계가 가장 높은 지역", icon: TrendingUp },
    { title: "재구매 비율", value: formatPercent(analytics.returningRate), detail: "재구매로 분류된 행의 비중", icon: Users, accent: "amber" as const },
    { title: "최고 매출 카테고리", value: analytics.topCategory, detail: "매출 비중이 가장 높은 카테고리", icon: Package, accent: "lime" as const },
  ];

  const summaryCards = [
    ["분석 데이터", `총 ${formatNumber(filteredRecords.length)}건`, "현재 조건으로 집계된 주문 수입니다."],
    ["핵심 카테고리", analytics.topCategory, "매출 비중이 가장 높은 카테고리입니다."],
    ["주요 지역", analytics.topRegion, "가장 큰 매출을 만든 지역입니다."],
    ["고객 흐름", formatPercent(analytics.returningRate), "재구매 주문이 차지하는 비율입니다."],
  ];

  const moveToUploadPanel = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadSample = () => {
    readingRequest.current += 1;
    setReading(false);
    setRecords(sampleData);
    setSource("sample");
    setFileName("sample-sales-data.csv");
    setError(undefined);
    setFilters(emptyFilters);
    setSortKey("date");
    setSortDirection("asc");
    setDataVersion((version) => version + 1);
  };

  const loadSampleAndMoveToDashboard = () => {
    loadSample();
    window.setTimeout(moveToUploadPanel, 50);
  };

  const handleFile = async (file: File) => {
    const request = ++readingRequest.current;
    setReading(false);
    setError(undefined);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("CSV 파일만 업로드할 수 있습니다. 필수 컬럼 형식을 확인해주세요.");
      return;
    }
    if (file.size > MAX_CSV_BYTES) {
      setError("CSV는 10MB 이하 파일만 지원합니다.");
      return;
    }
    setReading(true);
    try {
      const buffer = await file.arrayBuffer();
      if (request !== readingRequest.current) return;
      let text: string;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
      } catch {
        throw new Error("파일을 UTF-8로 읽을 수 없습니다. 엑셀에서 CSV UTF-8 형식으로 저장해 주세요.");
      }
      const parsed = parseSalesCsv(text);
      if (parsed.error) throw new Error(parsed.error);
      if (request !== readingRequest.current) return;
      setRecords(parsed.data);
      setSource("upload");
      setFileName(file.name);
      setFilters(emptyFilters);
      setSortKey("date");
      setSortDirection("asc");
      setDataVersion((version) => version + 1);
    } catch (failure) {
      if (request === readingRequest.current) setError(failure instanceof Error ? failure.message : "파일을 읽지 못했습니다. 다시 선택해 주세요.");
    } finally {
      if (request === readingRequest.current) setReading(false);
    }
  };

  const reset = () => {
    readingRequest.current += 1;
    setReading(false);
    setRecords([]);
    setSource("empty");
    setFileName(undefined);
    setError(undefined);
    setFilters(emptyFilters);
    setSortKey("date");
    setSortDirection("asc");
  };

  const handleDownload = () => {
    const blob = new Blob([recordsToCsv(filteredRecords)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "insightboard-filtered-data.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "date" ? "asc" : "desc");
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 pb-14 sm:px-6 lg:px-10">
      <Hero onSample={loadSampleAndMoveToDashboard} onUploadFocus={moveToUploadPanel} />
      <header className="print-only print-report-header">
        <h1>InsightBoard 매출 리포트</h1>
        <p>{fileName} · {source === "sample" ? "가상 샘플 데이터" : "업로드 데이터"} · {formatNumber(filteredRecords.length)}건</p>
        <p>{[filters.query && "검색: " + filters.query, filters.category, filters.customerType, filters.region, filters.startDate && "시작: " + filters.startDate, filters.endDate && "종료: " + filters.endDate].filter(Boolean).join(" · ") || "전체 데이터 기준"}</p>
      </header>

      <div ref={uploadRef}>
        <UploadPanel
          fileName={fileName}
          recordCount={records.length}
          sourceLabel={sourceLabel}
          error={error}
          isReading={isReading}
          onFile={handleFile}
          onSample={loadSample}
          onReset={reset}
        />
      </div>

      {!hasData ? (
        <section className="mt-12 min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-bold text-slate-950">CSV를 업로드하거나 샘플 데이터로 대시보드를 확인해보세요.</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            필요한 컬럼은 date, product, category, price, quantity, customerType, region입니다. 데이터가 들어오면 주요 지표와 차트,
            테이블이 같은 기준으로 갱신됩니다.
          </p>
          <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-3">
            {["KPI 계산", "매출 차트", "필터링 테이블"].map((item) => (
              <div key={item} className="min-w-0 rounded-xl border border-stone-100 bg-stone-50 p-5 font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {hasData ? (
        <>
          <section className="print-grid mt-14 grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {primaryKpis.map((kpi) => (
              <KpiCard key={kpi.title} {...kpi} />
            ))}
          </section>

          <div className="mt-4 inline-flex max-w-full rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
            {filterBasisLabel}
          </div>

          <section className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {secondaryKpis.map((kpi) => (
              <KpiCard key={kpi.title} {...kpi} />
            ))}
          </section>

          <section className="print-section mt-12 min-w-0 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">분석 요약</h2>
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map(([title, value, detail]) => (
                <article key={title} className="min-w-0 rounded-xl border border-emerald-100 bg-white p-5">
                  <p className="text-sm font-bold text-emerald-700">{title}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="no-print mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasFilteredData || isReading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <Download size={17} />
              CSV 다운로드
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={isReading || !hasFilteredData}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Printer size={17} />
              리포트 저장
            </button>
          </section>

          <section className="print-grid mt-14 grid min-w-0 gap-6 lg:grid-cols-2">
            <ChartCard title="매출 추이" description="날짜별 매출 변화를 확인합니다." empty={!hasFilteredData}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyRevenue}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.38} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d8" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `${Number(value) / 1000}천`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} labelFormatter={(label) => `날짜: ${label}`} />
                  <Area type="linear" dataKey="revenue" name="매출" stroke="#10B981" fill="url(#revenue)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="카테고리별 매출 비율" description={analytics.categoryRevenue.length > 8 ? "매출 상위 7개 카테고리와 나머지 합계를 비교합니다." : "카테고리별 매출 비중을 비교합니다."} empty={!hasFilteredData || analytics.totalRevenue === 0} emptyMessage={hasFilteredData ? "매출이 0원이므로 비중을 계산할 수 없습니다." : undefined}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3} isAnimationActive={false}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 11, maxHeight: 72, overflowY: "auto", overflowWrap: "anywhere" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="상품별 매출 TOP 5" description="매출 기여도가 높은 상품을 정리했습니다." empty={!hasFilteredData}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.productRevenue} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d8" />
                  <XAxis type="number" tickFormatter={(value) => `${Number(value) / 1000}천`} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} tickFormatter={(value) => String(value).length > 8 ? String(value).slice(0, 8) + "…" : String(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" name="매출" fill="#14B8A6" radius={[0, 8, 8, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="지역별 매출 비교" description={analytics.regionRevenue.length > 10 ? "매출 상위 9개 지역과 나머지 합계를 비교합니다." : "지역별 매출 규모를 비교합니다."} empty={!hasFilteredData}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickFormatter={(value) => String(value).length > 6 ? String(value).slice(0, 6) + "…" : String(value)} />
                  <YAxis tickFormatter={(value) => `${Number(value) / 1000}천`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" name="매출" fill="#F59E0B" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <CustomerMixCard
              hasData={hasFilteredData}
              newCount={newCustomerCount}
              returningCount={returningCustomerCount}
              newRate={newCustomerRate}
              returningRate={returningCustomerRate}
            />

            <KeyMetricCard
              orderCount={filteredRecords.length}
              topRegion={analytics.topRegion}
              topProduct={analytics.topProduct}
              returningRate={analytics.returningRate}
            />
          </section>

          <section className="mt-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-950">데이터 인사이트</h2>
              <p className="mt-2 text-sm text-slate-500">집계 결과에서 바로 확인할 수 있는 운영 포인트입니다.</p>
            </div>
            <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {insights.map((insight) => (
                <InsightCard key={insight.title} insight={insight} />
              ))}
            </div>
          </section>

          <section className="mt-16">
            <DataTable
              key={dataVersion}
              records={filteredRecords}
              printing={isPrinting}
              filters={filters}
              categories={categories}
              customerTypes={customerTypes}
              regions={regions}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onSortChange={handleSortChange}
              onResetFilters={() => setFilters(emptyFilters)}
            />
          </section>
        </>
      ) : null}

      <div className="no-print mt-16">
        <ProjectOverview />
      </div>
      <footer className="no-print py-8 text-center text-sm text-slate-500">
        InsightBoard는 CSV 매출 데이터를 지표, 차트, 테이블, 리포트 흐름으로 정리한 포트폴리오 프로젝트입니다.
      </footer>
    </main>
  );
}

function CustomerMixCard({
  hasData,
  newCount,
  returningCount,
  newRate,
  returningRate,
}: {
  hasData: boolean;
  newCount: number;
  returningCount: number;
  newRate: number;
  returningRate: number;
}) {
  return (
    <article className="print-section min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-bold text-slate-950">신규/재구매 주문 비중</h3>
      <p className="mt-2 text-[13px] leading-6 text-slate-600">고객 유형별 주문 비중을 비교합니다.</p>
      {hasData ? (
        <div className="mt-8">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <CustomerRatio label="신규 주문" value={newRate} count={newCount} className="text-lime-700" />
            <CustomerRatio label="재구매 주문" value={returningRate} count={returningCount} className="text-orange-600" />
          </div>
          <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full bg-lime-500" style={{ width: `${newRate}%` }} />
            <div className="h-full bg-orange-500" style={{ width: `${returningRate}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
            <span>신규</span>
            <span>재구매</span>
          </div>
        </div>
      ) : (
        <EmptyCard />
      )}
    </article>
  );
}

function CustomerRatio({ label, value, count, className }: { label: string; value: number; count: number; className: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-stone-100 bg-stone-50 p-5">
      <p className={`text-sm font-bold ${className}`}>{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{formatPercent(value)}</p>
      <p className="mt-2 text-sm text-slate-600">{formatNumber(count)}건</p>
    </div>
  );
}

function KeyMetricCard({
  orderCount,
  topRegion,
  topProduct,
  returningRate,
}: {
  orderCount: number;
  topRegion: string;
  topProduct: string;
  returningRate: number;
}) {
  const items = [
    ["분석 주문", `${formatNumber(orderCount)}건`],
    ["최고 지역", topRegion],
    ["최고 상품", topProduct],
    ["재구매 비율", formatPercent(returningRate)],
  ];

  return (
    <article className="print-section min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-bold text-slate-950">핵심 지표 보조 카드</h3>
      <p className="mt-2 text-[13px] leading-6 text-slate-600">현재 조건에서 눈여겨볼 값을 따로 정리했습니다.</p>
      <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function EmptyCard() {
  return (
    <div className="mt-6 flex h-56 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm font-semibold text-slate-500">
      표시할 데이터가 없습니다.
    </div>
  );
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function compactChartGroups(groups: { name: string; value: number }[], limit: number) {
  if (groups.length <= limit) return groups;
  const visible = groups.slice(0, limit - 1);
  const remaining = groups.slice(limit - 1);
  let name = `기타 ${remaining.length}개 (합산)`;
  while (groups.some((group) => group.name === name)) name += "*";
  return [...visible, { name, value: remaining.reduce((sum, group) => sum + group.value, 0) }];
}
