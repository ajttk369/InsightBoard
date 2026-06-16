import type { CustomerType, SalesRecord } from "@/types/sales";

const products = [
  { product: "에코백", category: "패션", price: 29000 },
  { product: "파우치", category: "잡화", price: 15000 },
  { product: "키링", category: "잡화", price: 8000 },
  { product: "텀블러", category: "리빙", price: 22000 },
  { product: "다이어리", category: "문구", price: 12000 },
  { product: "데스크매트", category: "문구", price: 18000 },
  { product: "캔들", category: "리빙", price: 26000 },
  { product: "머그컵", category: "리빙", price: 14000 },
  { product: "볼캡", category: "패션", price: 32000 },
  { product: "스티커팩", category: "문구", price: 7000 },
];

const regions = ["서울", "부산", "인천", "대구", "광주", "대전", "제주"];
const customerTypes: CustomerType[] = ["신규", "재구매"];

export const sampleData: SalesRecord[] = Array.from({ length: 64 }, (_, index) => {
  const product = products[(index * 3 + Math.floor(index / 6)) % products.length];
  const day = String((index % 30) + 1).padStart(2, "0");
  const month = index < 34 ? "06" : "07";
  const quantity = ((index * 7) % 5) + 1;
  const region = regions[(index * 2 + Math.floor(index / 8)) % regions.length];
  const customerType = customerTypes[(index + (region === "서울" ? 1 : 0)) % 2];
  const lift = region === "서울" ? 1.08 : product.category === "잡화" ? 1.12 : 1;

  return {
    id: `sample-${index + 1}`,
    date: `2026-${month}-${day}`,
    product: product.product,
    category: product.category,
    price: Math.round((product.price * lift) / 1000) * 1000,
    quantity,
    customerType,
    region,
  };
});
