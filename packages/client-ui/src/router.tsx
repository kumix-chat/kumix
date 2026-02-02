import { appRootClass } from "@kumix/ui";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell } from "./app/AppShell";
import { AboutPage } from "./features/about/AboutPage";
import { DataPage } from "./features/data/DataPage";
import { ExtensionsPage } from "./features/extensions/ExtensionsPage";
import { HomePage } from "./features/home/HomePage";
import { MatrixPage } from "./features/matrix/MatrixPage";

export type KumixRouterOptions = {
  homeRight?: ReactNode;
  headerRight?: ReactNode;
};

export function createKumixRouter(options: KumixRouterOptions = {}) {
  const rootRoute = createRootRoute({
    component: () => (
      <div className={appRootClass}>
        <AppShell headerRight={options.headerRight} />
      </div>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <HomePage right={options.homeRight} />,
  });

  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "about",
    component: () => <AboutPage />,
  });

  const dataRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "data",
    component: () => <DataPage />,
  });

  const extensionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "extensions",
    component: () => <ExtensionsPage />,
  });

  const matrixRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "matrix",
    component: () => <MatrixPage />,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    dataRoute,
    extensionsRoute,
    matrixRoute,
  ]);
  return createRouter({ routeTree });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createKumixRouter>;
  }
}
