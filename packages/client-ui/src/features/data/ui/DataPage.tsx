import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, cn } from "@kumix/ui"
import { flexRender } from "@tanstack/react-table"
import { useDataVm } from "../vm/useDataVm"

function sortIndicator(sort: false | "asc" | "desc"): string {
  if (sort === "asc") return "^"
  if (sort === "desc") return "v"
  return ""
}

export function DataPage() {
  const vm = useDataVm()
  const table = vm.state.table
  const rows = vm.state.rows
  const rowVirtualizer = vm.state.rowVirtualizer

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
            <Button variant="ghost" onClick={() => vm.actions.clearFilter()} disabled={!vm.state.filterText}>
              <Trans id="data.button.clear">Clear</Trans>
            </Button>
            <Button variant="ghost" onClick={() => vm.actions.invalidate()}>
              <Trans id="data.button.invalidate">Invalidate</Trans>
            </Button>
            <Button variant="ghost" onClick={() => vm.actions.refetch()}>
              <Trans id="data.button.refetch">Refetch</Trans>
            </Button>
          </div>
        </CardContent>
      </Card>

      {vm.state.isLoading ? (
        <Card>
          <CardContent className="p-4 text-sm text-slate-200">
            <Trans id="data.loading">Loading...</Trans>
          </CardContent>
        </Card>
      ) : vm.state.isError ? (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 text-sm text-red-100">
            <Trans id="data.error">Failed to load data:</Trans>{" "}
            {vm.state.errorMessage ?? "Unknown error"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          <div className="text-xs text-slate-400">
            <Trans id="data.label.rows">Rows:</Trans>{" "}
            <span className="text-slate-200">{vm.state.rowsCount.toLocaleString()}</span>
          </div>

          <div ref={vm.refs.scrollRef} className="h-[560px] overflow-auto rounded-xl border border-white/10 bg-slate-950">
            <div className="sticky top-0 z-10 grid grid-cols-[80px_1fr_160px_140px_140px] items-center border-b border-white/10 bg-slate-950/95 px-3 text-xs font-semibold text-slate-200 backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const sort = header.column.getIsSorted()

                  return (
                    <button
                      key={header.id}
                      type="button"
                      className={cn(
                        "flex h-11 items-center justify-start gap-2 text-left",
                        sortable ? "cursor-pointer select-none hover:text-white" : "cursor-default"
                      )}
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      <span className="text-slate-400">{sortIndicator(sort)}</span>
                    </button>
                  )
                })
              )}
            </div>

            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index]
                if (!row) return null

                return (
                  <div
                    key={row.id}
                    className={cn(
                      "absolute left-0 top-0 grid w-full grid-cols-[80px_1fr_160px_140px_140px] items-center border-b border-white/5 px-3 text-sm",
                      virtualRow.index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                    )}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="h-11 overflow-hidden text-ellipsis whitespace-nowrap pr-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
