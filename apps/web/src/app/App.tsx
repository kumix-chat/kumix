import { createKumixRouter, KumixAppProviders, LanguageSwitcher } from "@kumix/client-ui";
import { RouterProvider } from "@tanstack/react-router";

const router = createKumixRouter({ headerRight: <LanguageSwitcher /> });

export function App() {
  return (
    <KumixAppProviders>
      <RouterProvider router={router} />
    </KumixAppProviders>
  );
}
