import { RouterProvider } from "@tanstack/react-router"
import { createKumixRouter, KumixAppProviders, LanguageSwitcher } from "@kumix/client-ui"

const router = createKumixRouter({ headerRight: <LanguageSwitcher /> })

export function App() {
  return (
    <KumixAppProviders>
      <RouterProvider router={router} />
    </KumixAppProviders>
  )
}
