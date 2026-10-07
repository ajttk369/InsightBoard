import Papa from "papaparse";
import type { CustomerType, SalesRecord } from "@/types/sales";

export const MAX_CSV_BYTES = 10 * 1024 * 1024;
export const MAX_CSV_ROWS = 50_000;

const requiredHeaders = ["date", "product", "category", "price", "quantity", "customerType", "region"];
const customerMap = new Map<string, CustomerType>([
  ["new", "신규"],
  ["returning", "재구매"],
  ["신규", "신규"],
  ["재구매", "재구매"],
]);

const parseNumber = (value: string) => {
  const normalized = value.trim().replace(/^₩\s*/, "");
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(normalized)) return NaN;
  return Number(normalized.replace(/,/g, ""));
};

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const timestamp = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
};

export const parseSalesCsv = (text: string): { data: SalesRecord[]; error?: string } => {
  const normalized = text.replace(/^\uFEFF/, "");
  if (!normalized.trim()) return { data: [], error: "분석할 데이터가 없습니다. 파일 내용을 확인해 주세요." };
  if (normalized.length > MAX_CSV_BYTES) return { data: [], error: "CSV는 10MB 이하 파일만 지원합니다." };

  const parsed = Papa.parse<string[]>(normalized, {
    delimiter: ",",
    dynamicTyping: false,
    skipEmptyLines: "greedy",
    preview: MAX_CSV_ROWS + 2,
  });
  if (parsed.errors.length) {
    const first = parsed.errors[0];
    const location = first.row === undefined ? "" : (first.row + 1) + "번째 레코드의 ";
    return { data: [], error: location + "따옴표 또는 CSV 구분 형식이 올바르지 않습니다." };
  }

  const headers = (parsed.data[0] ?? []).map((header) => header.trim());
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length) return { data: [], error: "누락된 컬럼: " + missing.join(", ") };
  if (new Set(headers).size !== headers.length || headers.some((header) => !header)) {
    return { data: [], error: "비어 있거나 중복된 컬럼명이 있습니다. 헤더를 확인해 주세요." };
  }
  if (parsed.data.length - 1 > MAX_CSV_ROWS || parsed.meta.truncated) {
    return { data: [], error: "CSV는 최대 50,000개의 데이터 행까지 지원합니다." };
  }

  const positions = new Map(headers.map((header, index) => [header, index]));
  const records: SalesRecord[] = [];
  let totalRevenue = 0;
  let totalQuantity = 0;

  for (let index = 1; index < parsed.data.length; index += 1) {
    const values = parsed.data[index];
    const rowNumber = index + 1;
    if (values.length !== headers.length) {
      return { data: [], error: rowNumber + "번째 레코드의 컬럼 수가 헤더와 다릅니다." };
    }
    const get = (key: string) => values[positions.get(key)!].trim();
    const date = get("date");
    const product = get("product");
    const category = get("category");
    const region = get("region");
    const price = parseNumber(get("price"));
    const quantity = parseNumber(get("quantity"));
    const customerType = customerMap.get(get("customerType").toLowerCase());

    if (!isValidDate(date)) {
      return { data: [], error: rowNumber + "번째 레코드의 날짜는 실제 존재하는 YYYY-MM-DD 날짜여야 합니다." };
    }
    if (!product || !category || !region) {
      return { data: [], error: rowNumber + "번째 레코드에 비어 있는 상품명, 카테고리 또는 지역 값이 있습니다." };
    }
    if ([product, category, region].some((value) => value.length > 200)) {
      return { data: [], error: rowNumber + "번째 레코드의 상품명, 카테고리, 지역은 각각 200자 이하여야 합니다." };
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
      return { data: [], error: rowNumber + "번째 레코드의 가격은 0 이상의 숫자, 수량은 양의 정수여야 합니다. 빈 값은 사용할 수 없습니다." };
    }
    const revenue = price * quantity;
    totalRevenue += revenue;
    totalQuantity += quantity;
    if (!Number.isFinite(revenue) || totalRevenue > Number.MAX_SAFE_INTEGER || !Number.isSafeInteger(totalQuantity)) {
      return { data: [], error: "매출 또는 수량 합계가 안전하게 계산할 수 있는 범위를 초과합니다." };
    }
    if (!customerType) {
      return { data: [], error: rowNumber + "번째 레코드의 customerType은 New, Returning, 신규, 재구매 중 하나여야 합니다." };
    }

    records.push({ id: "csv-" + index, date, product, category, price, quantity, customerType, region });
  }

  return records.length ? { data: records } : { data: [], error: "헤더 외에 분석할 데이터가 없습니다." };
};

export const recordsToCsv = (records: SalesRecord[]) => {
  const csv = Papa.unparse({
    fields: ["date", "product", "category", "price", "quantity", "revenue", "customerType", "region"],
    data: records.map((record) => [
      record.date, record.product, record.category, record.price,
      record.quantity, record.price * record.quantity, record.customerType, record.region,
    ]),
  }, {
    quotes: true,
    newline: "\r\n",
    // Spreadsheet applications must treat user-controlled labels as text.
    escapeFormulae: /^(?:[\t\r\n]|[\s\uFEFF]*[=+\-@＝＋－＠])/,
  });
  return "\uFEFF" + csv;
};
