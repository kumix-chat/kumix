import type { MatrixAdapterPort } from "@kumix/client-core";
import { matrixAdapter } from "@kumix/matrix-adapter";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

const MatrixAdapterContext = createContext<MatrixAdapterPort | null>(null);

export function KumixMatrixAdapterProvider(props: {
  children: ReactNode;
  value?: MatrixAdapterPort;
}) {
  const value = useMemo(() => props.value ?? matrixAdapter, [props.value]);
  return (
    <MatrixAdapterContext.Provider value={value}>{props.children}</MatrixAdapterContext.Provider>
  );
}

export function useKumixMatrixAdapter(): MatrixAdapterPort {
  const value = useContext(MatrixAdapterContext);
  return value ?? matrixAdapter;
}
