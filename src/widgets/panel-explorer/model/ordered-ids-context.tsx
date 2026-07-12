import { createContext, useContext, useLayoutEffect, useRef } from "react";

type OrderedIdsRef = React.RefObject<string[]>;

const OrderedIdsContext = createContext<OrderedIdsRef | null>(null);

interface ProviderProps {
  orderedIds: string[];
  children: React.ReactNode;
}

export function OrderedIdsProvider({ orderedIds, children }: ProviderProps) {
  const ref = useRef<string[]>([]);

  useLayoutEffect(() => {
    ref.current = orderedIds;
  }, [orderedIds]);

  return <OrderedIdsContext value={ref}>{children}</OrderedIdsContext>;
}

export function useOrderedIdsRef() {
  const ref = useContext(OrderedIdsContext);
  if (!ref) {
    throw new Error("useOrderedIdsRef provider missing");
  }
  return ref;
}
