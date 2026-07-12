import { useRef } from "react";

/** Returns how many times the calling component has rendered. Pure React, no deps. */
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
