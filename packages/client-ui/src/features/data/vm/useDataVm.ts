import { t } from "@lingui/core/macro";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Row, SortingState, Table } from "@tanstack/react-table";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { RefObject } from "react";
import { useMemo, useRef, useState } from "react";
import { createMockProducts, type Product } from "../mockProducts";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PRODUCTS = createMockProducts(5_000);

async function fetchProducts(): Promise<Product[]> {
  await sleep(350);
  return PRODUCTS;
}

export type DataVm = {
  refs: {
    scrollRef: RefObject<HTMLDivElement | null>;
  };
  state: {
    filterText: string;
    rowsCount: number;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    table: Table<Product>;
    rows: Row<Product>[];
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  };
  actions: {
    setFilterText(value: string): void;
    clearFilter(): void;
    invalidate(): void;
    refetch(): void;
  };
};

export function useDataVm(): DataVm {
  const queryClient = useQueryClient();
  const [filterText, setFilterText] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: false }]);

  const productsQuery = useQuery({
    queryKey: ["demo", "products"],
    queryFn: fetchProducts,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  const filteredData = useMemo(() => {
    const data = productsQuery.data ?? [];
    if (!filterText) return data;
    const normalized = filterText.trim().toLowerCase();
    if (!normalized) return data;
    return data.filter((row) => {
      return (
        row.name.toLowerCase().includes(normalized) ||
        row.category.toLowerCase().includes(normalized)
      );
    });
  }, [filterText, productsQuery.data]);

  const columnHelper = useMemo(() => createColumnHelper<Product>(), []);
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", { header: t({ id: "data.column.id", message: "ID" }) }),
      columnHelper.accessor("name", { header: t({ id: "data.column.name", message: "Name" }) }),
      columnHelper.accessor("category", {
        header: t({ id: "data.column.category", message: "Category" }),
      }),
      columnHelper.accessor("priceUsd", {
        header: t({ id: "data.column.price", message: "Price (USD)" }),
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("updatedAt", {
        header: t({ id: "data.column.updated", message: "Updated" }),
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 44,
    overscan: 12,
  });

  const isLoading = productsQuery.status === "pending";
  const isError = productsQuery.status === "error";
  const errorMessage = isError
    ? productsQuery.error instanceof Error
      ? productsQuery.error.message
      : "Unknown error"
    : null;

  return {
    refs: { scrollRef },
    state: {
      filterText,
      rowsCount: rows.length,
      isLoading,
      isError,
      errorMessage,
      table,
      rows,
      rowVirtualizer,
    },
    actions: {
      setFilterText,
      clearFilter: () => setFilterText(""),
      invalidate: () => queryClient.invalidateQueries({ queryKey: ["demo", "products"] }),
      refetch: () => productsQuery.refetch(),
    },
  };
}
