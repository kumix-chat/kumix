import { RootRoute, Route, createRouter } from "@tanstack/react-router"
import { appRootClass } from "@kumix/ui"
import { AppShell } from "./app/AppShell"
import { AboutPage } from "./features/about/AboutPage"
import { DataPage } from "./features/data/DataPage"
import { ExtensionsPage } from "./features/extensions/ExtensionsPage"
import { HomePage } from "./features/home/HomePage"
import type { ReactNode } from "react"

export type KumixRouterOptions = {
  homeRight?: ReactNode
  headerRight?: ReactNode
}

export function createKumixRouter(options: KumixRouterOptions = {}) {
  const rootRoute = new RootRoute({
    component: () => (
      <div className={appRootClass}>
        <AppShell headerRight={options.headerRight} />
      </div>
    )
  })

  const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <HomePage right={options.homeRight} />
  })

  const aboutRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "about",
    component: () => <AboutPage />
  })

  const dataRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "data",
    component: () => <DataPage />
  })

  const extensionsRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "extensions",
    component: () => <ExtensionsPage />
  })

  const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, dataRoute, extensionsRoute])
  return createRouter({ routeTree })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createKumixRouter>
  }
}
