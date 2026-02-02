import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kumix/ui";
import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { useHomeVm } from "../vm/useHomeVm";

export function HomePage(props: { right?: ReactNode }) {
  const vm = useHomeVm();

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans id="home.title">Home</Trans>
          </CardTitle>
          <CardDescription>
            <Trans id="home.description">
              This is a minimal monorepo scaffold: shared packages + TanStack Router + (optional)
              Tauri backend.
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button onPress={() => vm.actions.showMessage()}>
              <Trans id="home.button.click">Click</Trans>
            </Button>
            <Button intent="outline" onPress={() => vm.actions.increment()}>
              <Trans id="home.button.countPlusOne">Count +1 ({vm.state.count})</Trans>
            </Button>
            {props.right}
          </div>
          {vm.state.showMessage ? (
            <div className="text-xs text-[color:var(--muted-fg)]">
              <Trans id="home.message.hello">Hello from kumix</Trans>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
