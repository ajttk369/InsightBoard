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
    .sort((a, b) => b.value - a.value);
};

const groupQuantity = (records: SalesRecord[]) => {
  const totals = new Map<string, number>();

  records.forEach((record) => {
    totals.set(record.product, (totals.get(record.product) ?? 0) + record.quantity);
  });

  return [...totals.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
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
    topCategory: categoryRevenue[0]?.name ?? "-",
    topProduct: productQuantity[0]?.name ?? "-",
    topRegion: regionRevenue[0]?.name ?? "-",
    categoryRevenue,
    productRevenue: productRevenue.slice(0, 5),
    regionRevenue,
    customerRevenue,
    dailyRevenue: dailyRevenue.map(({ name, value }) => ({ date: name, revenue: value })),
  };
};

export const buildInsights = (records: SalesRecord[]): Insight[] => {
  if (records.length === 0) return [];

  const analytics = buildAnalytics(records);
  const categoryShare = analytics.categoryRevenue[0] ? (analytics.categoryRevenue[0].value / analytics.totalRevenue) * 100 : 0;
  const topProductsShare = analytics.totalRevenue
    ? (analytics.productRevenue.reduce((sum, item) => sum + item.value, 0) / analytics.totalRevenue) * 100
    : 0;
  const topRegionRevenue = analytics.regionRevenue[0]?.value ?? 0;
  const regionShare = analytics.totalRevenue ? (topRegionRevenue / analytics.totalRevenue) * 100 : 0;

  return [
    {
      title: "카테고리 집중도",
      body: `${analytics.topCategory} 카테고리가 전체 매출의 ${categoryShare.toFixed(1)}%를 차지합니다. 주력 카테고리로 따로 관리할 만합니다.`,
      tag: "카테고리",
      tone: "positive",
    },
    {
      title: "재구매 흐름",
      body: `재구매 비율은 ${analytics.returningRate.toFixed(1)}%입니다. 반복 구매 고객을 위한 혜택이나 알림을 분리해 볼 수 있습니다.`,
      tag: "고객",
      tone: analytics.returningRate >= 35 ? "positive" : "suggestion",
    },
    {
      title: "지역 매출",
      body: `${analytics.topRegion} 지역이 전체 매출의 ${regionShare.toFixed(1)}%를 만들었습니다. 지역별 프로모션 기준으로 활용할 수 있습니다.`,
      tag: "지역",
      tone: "positive",
    },
    {
      title: "상품 의존도",
      body: `상위 5개 상품이 전체 매출의 ${topProductsShare.toFixed(1)}%를 차지합니다. 품절과 재고 회전율을 같이 확인하는 것이 좋습니다.`,
      tag: "상품",
      tone: topProductsShare >= 60 ? "warning" : "suggestion",
    },
  ];
};
