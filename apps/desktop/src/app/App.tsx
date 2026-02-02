import { RouterProvider } from "@tanstack/react-router"
import { createKumixRouter, KumixAppProviders, LanguageSwitcher } from "@kumix/client-ui"
import { createDesktopSqliteKeyValue } from "@kumix/storage"
import { invoke, isTauri } from "@tauri-apps/api/core"
import { DesktopBridge } from "./DesktopBridge"

const router = createKumixRouter({ homeRight: <DesktopBridge />, headerRight: <LanguageSwitcher /> })
const keyValue = createDesktopSqliteKeyValue({ invoke, isTauri })

export function App() {
  return (
    <KumixAppProviders keyValue={keyValue}>
      <RouterProvider router={router} />
    </KumixAppProviders>
  )
}
