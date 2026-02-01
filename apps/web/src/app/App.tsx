import { RouterProvider } from "@tanstack/react-router"
import { createKumixRouter, I18nAppProvider, LanguageSwitcher } from "@kumix/client-ui"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const router = createKumixRouter({ headerRight: <LanguageSwitcher /> })
const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nAppProvider>
        <RouterProvider router={router} />
      </I18nAppProvider>
    </QueryClientProvider>
  )
}
