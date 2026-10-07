import type { Insight, SalesRecord } from "@/types/sales";

const revenueOf = (record: SalesRecord) => record.price * record.quantity;

const groupRevenue = <T extends string>(records: SalesRecord[], keySelector: (record: SalesRecord) => T) => {
  const totals = new Map<T, number>();

  records.forEach((record) => {
    const key = keySelector(record);
    totals.set(key, (totals.get(key) ?? 0) + revenueOf(record));
  });

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "ko"));
};

const groupQuantity = (records: SalesRecord[]) => {
  const totals = new Map<string, number>();

  records.forEach((record) => {
    totals.set(record.product, (totals.get(record.product) ?? 0) + record.quantity);
  });

  return [...totals.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, "ko"));
};

export const getRevenue = revenueOf;

export const buildAnalytics = (records: SalesRecord[]) => {
  const totalRevenue = records.reduce((sum, record) => sum + revenueOf(record), 0);
  const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0);
  const totalOrders = records.length;
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const returningOrders = records.filter((record) => record.customerType === "재구매").length;
  const returningRate = totalOrders ? (returningOrders / totalOrders) * 100 : 0;

  const categoryRevenue = groupRevenue(records, (record) => record.category);
  const productRevenue = groupRevenue(records, (record) => record.product);
  const regionRevenue = groupRevenue(records, (record) => record.region);
  const customerRevenue = groupRevenue(records, (record) => record.customerType);
  const productQuantity = groupQuantity(records);
  const dailyRevenue = groupRevenue(records, (record) => record.date).sort((a, b) => a.name.localeCompare(b.name));

  return {
    totalRevenue,
    totalQuantity,
    totalOrders,
    averageOrderValue,
    returningRate,
    topCategory: totalRevenue > 0 ? categoryRevenue[0]?.name ?? "-" : "-",
    topProduct: productQuantity[0]?.name ?? "-",
    topRegion: totalRevenue > 0 ? regionRevenue[0]?.name ?? "-" : "-",
    categoryRevenue,
    productRevenue: productRevenue.slice(0, 5),
    regionRevenue,
    customerRevenue,
    dailyRevenue: dailyRevenue.map(({ name, value }) => ({ date: name, revenue: value })),
  };
};

export const buildInsights = (records: SalesRecord[], analytics = buildAnalytics(records)): Insight[] => {
  if (records.length === 0) return [];

  const categoryShare = analytics.totalRevenue > 0 ? (analytics.categoryRevenue[0].value / analytics.totalRevenue) * 100 : 0;
  const topProductsShare = analytics.totalRevenue
    ? (analytics.productRevenue.reduce((sum, item) => sum + item.value, 0) / analytics.totalRevenue) * 100
    : 0;
  const topRegionRevenue = analytics.regionRevenue[0]?.value ?? 0;
  const regionShare = analytics.totalRevenue ? (topRegionRevenue / analytics.totalRevenue) * 100 : 0;

  return [
    {
      title: "카테고리 집중도",
      body: analytics.totalRevenue > 0
        ? `${analytics.topCategory} 카테고리가 매출의 ${categoryShare.toFixed(1)}%를 차지합니다. 현재 필터에 포함된 데이터 기준입니다.`
        : "매출 합계가 0원이므로 카테고리 매출 비중을 계산할 수 없습니다.",
      tag: "카테고리",
      tone: "positive",
    },
    {
      title: "재구매 흐름",
      body: `재구매로 분류된 데이터 행의 비중은 ${analytics.returningRate.toFixed(1)}%입니다. 고객별 구매 이력으로 계산한 재구매율은 아닙니다.`,
      tag: "고객",
      tone: "suggestion",
    },
    {
      title: "지역 매출",
      body: analytics.totalRevenue > 0
        ? `${analytics.topRegion} 지역이 매출의 ${regionShare.toFixed(1)}%를 차지합니다. 고객 수가 아닌 매출 합계 기준입니다.`
        : "매출 합계가 0원이므로 지역별 매출 비중을 계산할 수 없습니다.",
      tag: "지역",
      tone: "positive",
    },
    {
      title: "상품 의존도",
      body: analytics.totalRevenue > 0
        ? `매출 상위 ${analytics.productRevenue.length}개 상품의 합계는 전체의 ${topProductsShare.toFixed(1)}%입니다. 판매 수량 순위와는 다를 수 있습니다.`
        : "매출 합계가 0원이므로 상품별 매출 비중을 계산할 수 없습니다.",
      tag: "상품",
      tone: "suggestion",
    },
  ];
};
