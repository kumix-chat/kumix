import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kumix/ui";
import { Trans } from "@lingui/react/macro";

export function AboutPage() {
  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans id="about.title">About</Trans>
          </CardTitle>
          <CardDescription>
            <Trans id="about.description">
              Put feature slices under <code>packages/client-ui/src/features</code> and keep apps
              thin.
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--muted-fg)]">
          <ul className="list-disc pl-5">
            <li>
              <Trans id="about.list.ui">UI:</Trans> <code>packages/client-ui</code> +{" "}
              <code>packages/ui</code>
            </li>
            <li>
              <Trans id="about.list.core">Core:</Trans> <code>packages/client-core</code>
            </li>
            <li>
              <Trans id="about.list.adapter">Adapter:</Trans> <code>packages/matrix-adapter</code>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
