export type Product = {
  id: number;
  name: string;
  category: string;
  priceUsd: number;
  updatedAt: string;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function isoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

const BASE: Array<Pick<Product, "name" | "category" | "priceUsd">> = [
  { name: "Kumix Notes", category: "Docs", priceUsd: 4.99 },
  { name: "Kumix Search", category: "Search", priceUsd: 9.99 },
  { name: "Kumix Spaces", category: "Workspace", priceUsd: 6.5 },
  { name: "Kumix Unfurl", category: "Extensions", priceUsd: 2.0 },
  { name: "Kumix Calls", category: "Voice", priceUsd: 12.0 },
];

export function createMockProducts(count: number): Product[] {
  const result: Product[] = [];

  for (let index = 0; index < count; index++) {
    const base = BASE[index % BASE.length];
    if (!base) continue;
    result.push({
      id: index + 1,
      name: `${base.name} #${index + 1}`,
      category: base.category,
      priceUsd: base.priceUsd + (index % 7) * 0.25,
      updatedAt: isoDate(index % 30),
    });
  }

  return result;
}
