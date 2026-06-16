export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value);

export const formatPercent = (value: number) =>
  `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value)}%`;

export const toDateLabel = (value: string) => value.slice(0, 10);
