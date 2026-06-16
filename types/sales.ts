export type CustomerType = "신규" | "재구매";

export type SalesRecord = {
  id: string;
  date: string;
  product: string;
  category: string;
  price: number;
  quantity: number;
  customerType: CustomerType;
  region: string;
};

export type SortKey = "date" | "revenue" | "quantity";

export type DashboardSource = "empty" | "sample" | "upload";

export type Filters = {
  query: string;
  category: string;
  customerType: string;
  region: string;
  startDate: string;
  endDate: string;
};

export type InsightTone = "positive" | "warning" | "suggestion";

export type Insight = {
  title: string;
  body: string;
  tag: "매출" | "고객" | "지역" | "상품" | "카테고리";
  tone: InsightTone;
};
