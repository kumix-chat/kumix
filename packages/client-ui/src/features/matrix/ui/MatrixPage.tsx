import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@kumix/ui";
import { Trans } from "@lingui/react/macro";
import { useMatrixVm } from "../vm/useMatrixVm";

export function MatrixPage() {
  const vm = useMatrixVm();
  const running = vm.state.syncState.kind === "running" || vm.state.syncState.kind === "starting";

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans id="matrix.title">Matrix</Trans>
          </CardTitle>
          <CardDescription>
            <Trans id="matrix.description">
              Demonstrates the Matrix port boundary (adapter + client port).
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <div className="text-xs font-semibold text-slate-200">
              <Trans id="matrix.homeserver">Homeserver URL</Trans>
            </div>
            <Input
              value={vm.state.homeserverUrl}
              onChange={(e) => vm.actions.setHomeserverUrl(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-semibold text-slate-200">
              <Trans id="matrix.accessToken">Access token (demo)</Trans>
            </div>
            <Input
              value={vm.state.accessToken}
              onChange={(e) => vm.actions.setAccessToken(e.target.value)}
              placeholder="syt_xxx..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onPress={() => void vm.actions.start()} isDisabled={running}>
              <Trans id="matrix.start">Start sync</Trans>
            </Button>
            <Button intent="outline" onPress={() => void vm.actions.stop()} isDisabled={!running}>
              <Trans id="matrix.stop">Stop sync</Trans>
            </Button>
            <div className="text-sm text-slate-200">
              <Trans id="matrix.state">State:</Trans> {vm.state.syncState.kind}
            </div>
          </div>

          {vm.state.syncState.kind === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{vm.state.syncState.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
