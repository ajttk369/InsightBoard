import type { CustomerType, SalesRecord } from "@/types/sales";

const requiredHeaders = ["date", "product", "category", "price", "quantity", "customerType", "region"];

const customerMap: Record<string, CustomerType> = {
  New: "신규",
  Returning: "재구매",
  신규: "신규",
  재구매: "재구매",
};

const splitCsvLine = (line: string) => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

const parseNumber = (value: string) => Number(value.replace(/[₩,\s]/g, ""));

export const parseSalesCsv = (text: string): { data: SalesRecord[]; error?: string } => {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  if (!normalized) {
    return { data: [], error: "데이터를 읽을 수 없습니다. 파일 인코딩이나 컬럼명을 확인해주세요." };
  }

  const lines = normalized.split("\n").filter(Boolean);
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const missing = requiredHeaders.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    return { data: [], error: `CSV 컬럼 형식을 확인해주세요. 누락된 컬럼: ${missing.join(", ")}` };
  }

  const records: SalesRecord[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = splitCsvLine(lines[lineIndex]);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
    const price = parseNumber(row.price);
    const quantity = parseNumber(row.quantity);
    const customerType = customerMap[row.customerType];

    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
      return { data: [], error: `${lineIndex + 1}행의 날짜는 YYYY-MM-DD 형식이어야 합니다.` };
    }

    if (!row.product || !row.category || !row.region) {
      return { data: [], error: `${lineIndex + 1}행에 비어 있는 상품명, 카테고리 또는 지역 값이 있습니다.` };
    }

    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(quantity) || quantity <= 0) {
      return { data: [], error: `${lineIndex + 1}행의 가격 또는 수량 값이 올바르지 않습니다.` };
    }

    if (!customerType) {
      return { data: [], error: `${lineIndex + 1}행의 customerType은 New, Returning, 신규, 재구매 중 하나여야 합니다.` };
    }

    records.push({
      id: `csv-${lineIndex}`,
      date: row.date,
      product: row.product,
      category: row.category,
      price,
      quantity,
      customerType,
      region: row.region,
    });
  }

  if (records.length === 0) {
    return { data: [], error: "헤더 외에 분석할 데이터가 없습니다." };
  }

  return { data: records };
};

export const recordsToCsv = (records: SalesRecord[]) => {
  const header = "date,product,category,price,quantity,revenue,customerType,region";
  const rows = records.map((record) =>
    [record.date, record.product, record.category, record.price, record.quantity, record.price * record.quantity, record.customerType, record.region]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );

  return `\uFEFF${[header, ...rows].join("\n")}`;
};
