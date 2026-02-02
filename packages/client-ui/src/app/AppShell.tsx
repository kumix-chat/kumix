import { appHeaderClass, appMainClass, cn } from "@kumix/ui";
import { Trans } from "@lingui/react/macro";
import { Link, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function AppShell(props: { headerRight?: ReactNode }) {
  const linkBase = "text-sm font-medium text-[color:var(--navbar-fg)] opacity-80 hover:opacity-100";
  return (
    <>
      <header className={appHeaderClass}>
        <div className="flex items-center gap-3">
          <div className="font-extrabold tracking-tight">kumix</div>
          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className={linkBase}
              activeProps={{ className: cn(linkBase, "underline") }}
            >
              <Trans id="nav.home">Home</Trans>
            </Link>
            <Link
              to="/data"
              className={linkBase}
              activeProps={{ className: cn(linkBase, "underline") }}
            >
              <Trans id="nav.data">Data</Trans>
            </Link>
            <Link
              to="/extensions"
              className={linkBase}
              activeProps={{ className: cn(linkBase, "underline") }}
            >
              <Trans id="nav.extensions">Extensions</Trans>
            </Link>
            <Link
              to="/matrix"
              className={linkBase}
              activeProps={{ className: cn(linkBase, "underline") }}
            >
              <Trans id="nav.matrix">Matrix</Trans>
            </Link>
            <Link
              to="/about"
              className={linkBase}
              activeProps={{ className: cn(linkBase, "underline") }}
            >
              <Trans id="nav.about">About</Trans>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {props.headerRight}
          <div className="text-xs opacity-70">
            <Trans id="header.tagline">web / desktop shared UI</Trans>
          </div>
        </div>
      </header>
      <main className={appMainClass}>
        <Outlet />
      </main>
    </>
  );
}
