import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Input,
} from "@kumix/ui";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { flexRender } from "@tanstack/react-table";
import { useDataVm } from "../vm/useDataVm";

function sortIndicator(sort: false | "asc" | "desc"): string {
  if (sort === "asc") return "^";
  if (sort === "desc") return "v";
  return "";
}

export function DataPage() {
  const vm = useDataVm();
  const table = vm.state.table;
  const rows = vm.state.rows;
  const rowVirtualizer = vm.state.rowVirtualizer;

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans id="data.title">Data</Trans>
          </CardTitle>
          <CardDescription>
            <Trans id="data.description">
              TanStack Query + Table + Virtual demo (5,000 rows, sorted + virtualized).
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-72">
            <Input
              value={vm.state.filterText}
              onChange={(event) => vm.actions.setFilterText(event.target.value)}
              placeholder={t({ id: "data.placeholder.filter", message: "Filter name/category..." })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              intent="outline"
              onPress={() => vm.actions.clearFilter()}
              isDisabled={!vm.state.filterText}
            >
              <Trans id="data.button.clear">Clear</Trans>
            </Button>
            <Button intent="outline" onPress={() => vm.actions.invalidate()}>
              <Trans id="data.button.invalidate">Invalidate</Trans>
            </Button>
            <Button intent="outline" onPress={() => vm.actions.refetch()}>
              <Trans id="data.button.refetch">Refetch</Trans>
            </Button>
          </div>
        </CardContent>
      </Card>

      {vm.state.isLoading ? (
        <Card>
          <CardContent className="p-4 text-sm text-[color:var(--muted-fg)]">
            <Trans id="data.loading">Loading...</Trans>
          </CardContent>
        </Card>
      ) : vm.state.isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            <Trans id="data.error">Failed to load data:</Trans>
          </AlertTitle>
          <AlertDescription>{vm.state.errorMessage ?? "Unknown error"}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-2">
          <div className="text-xs text-[color:var(--muted-fg)] opacity-80">
            <Trans id="data.label.rows">Rows:</Trans>{" "}
            <span className="text-[color:var(--muted-fg)] opacity-100">
              {vm.state.rowsCount.toLocaleString()}
            </span>
          </div>

          <div
            ref={vm.refs.scrollRef}
            className="h-[560px] overflow-auto rounded-xl border border-[color:var(--border)] bg-[var(--overlay)]"
          >
            <div className="sticky top-0 z-10 grid grid-cols-[80px_1fr_160px_140px_140px] items-center border-b border-[color:var(--border)] bg-[color:var(--overlay)]/95 px-3 text-xs font-semibold text-[color:var(--fg)] backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sort = header.column.getIsSorted();

                  return (
                    <Button
                      key={header.id}
                      type="button"
                      intent="plain"
                      className={cn(
                        "h-11 justify-start px-0 py-0 text-left",
                        sortable ? "cursor-pointer" : "cursor-default",
                      )}
                      onPress={sortable ? () => header.column.toggleSorting() : undefined}
                    >
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      <span className="text-[color:var(--muted-fg)] opacity-70">
                        {sortIndicator(sort)}
                      </span>
                    </Button>
                  );
                }),
              )}
            </div>

            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) return null;

                return (
                  <div
                    key={row.id}
                    className={cn(
                      "absolute left-0 top-0 grid w-full grid-cols-[80px_1fr_160px_140px_140px] items-center border-b border-[color:var(--border)]/50 px-3 text-sm",
                      virtualRow.index % 2 === 0
                        ? "bg-[color:var(--overlay)]/60"
                        : "bg-transparent",
                    )}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className="h-11 overflow-hidden text-ellipsis whitespace-nowrap pr-3"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
