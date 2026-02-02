import { RouterProvider } from "@tanstack/react-router"
import { createKumixRouter, KumixAppProviders, LanguageSwitcher } from "@kumix/client-ui"
import { DesktopBridge } from "./DesktopBridge"

const router = createKumixRouter({ homeRight: <DesktopBridge />, headerRight: <LanguageSwitcher /> })

export function App() {
  return (
    <KumixAppProviders>
      <RouterProvider router={router} />
    </KumixAppProviders>
  )
}
