import { createContext, useContext, useLayoutEffect, useRef } from "react";
import type { SelectedEntityMeta } from "./types";

type OrderedItemsRef = React.RefObject<SelectedEntityMeta[]>;

const OrderedItemsContext = createContext<OrderedItemsRef | null>(null);

interface ProviderProps {
  orderedItems: SelectedEntityMeta[];
  children: React.ReactNode;
}

export function OrderedItemsProvider({ orderedItems, children }: ProviderProps) {
  const ref = useRef<SelectedEntityMeta[]>([]);

  useLayoutEffect(() => {
    ref.current = orderedItems;
  }, [orderedItems]);

  return <OrderedItemsContext value={ref}>{children}</OrderedItemsContext>;
}

export function useOrderedItemsRef() {
  const ref = useContext(OrderedItemsContext);
  if (!ref) {
    throw new Error("useOrderedItemsRef provider missing");
  }
  return ref;
}
