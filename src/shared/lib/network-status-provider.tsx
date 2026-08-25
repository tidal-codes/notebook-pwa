import { createContext, useContext } from "react";
import { useNetworkStatus, type NetworkStatus } from "./use-network-status";


const NetworkStatusContext = createContext<NetworkStatus | null>(null);

export function NetworkStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useNetworkStatus({ intervalMs: 30_000 });
  return (
    <NetworkStatusContext.Provider value={status}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatusContext(): NetworkStatus {
  const ctx = useContext(NetworkStatusContext);
  if (!ctx) {
    throw new Error(
      "useNetworkStatusContext must be used within NetworkStatusProvider",
    );
  }
  return ctx;
}
