import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kumix/ui"
import type { ReactNode } from "react"
import { useState } from "react"
import { useAtom } from "jotai"
import { useAppStore } from "../../state/appStore"
import { jotaiCountAtom } from "../../state/jotaiAtoms"
import { Trans } from "@lingui/react/macro"

export function HomePage(props: { right?: ReactNode }) {
  const [showMessage, setShowMessage] = useState(false)
  const [jotaiCount, setJotaiCount] = useAtom(jotaiCountAtom)
  const zustandCount = useAppStore((state) => state.count)
  const zustandIncrement = useAppStore((state) => state.increment)

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans id="home.title">Home</Trans>
          </CardTitle>
          <CardDescription>
            <Trans id="home.description">
              This is a minimal monorepo scaffold: shared packages + TanStack Router + (optional) Tauri backend.
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setShowMessage(true)}>
              <Trans id="home.button.click">Click</Trans>
            </Button>
            <Button variant="ghost" onClick={() => setJotaiCount((current) => current + 1)}>
              Jotai +1 ({jotaiCount})
            </Button>
            <Button variant="ghost" onClick={zustandIncrement}>
              Zustand +1 ({zustandCount})
            </Button>
            {props.right}
          </div>
          {showMessage ? (
            <div className="text-xs text-slate-200">
              <Trans id="home.message.hello">Hello from kumix</Trans>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
