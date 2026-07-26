import { useEffect, useState } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

const ORDERED_BREAKPOINTS = (Object.entries(BREAKPOINTS) as [Breakpoint, number][]).sort(
  (a, b) => a[1] - b[1],
);

type BreakpointValues<T> = Partial<Record<Breakpoint, T>> & { base?: T };

function getInitialMatches(): Record<Breakpoint, boolean> {
  const init = {} as Record<Breakpoint, boolean>;
  for (const [bp, width] of ORDERED_BREAKPOINTS) {
    init[bp] = typeof window !== "undefined" ? window.innerWidth >= width : false;
  }
  return init;
}

export function useBreakpointValue<T>(values: BreakpointValues<T>): T | undefined {
  const [matches, setMatches] = useState<Record<Breakpoint, boolean>>(getInitialMatches);

  useEffect(() => {
    const mediaQueryLists = ORDERED_BREAKPOINTS.map(
      ([bp, width]) => [bp, window.matchMedia(`(min-width: ${width}px)`)] as const,
    );

    const handleChange = () => {
      setMatches((prev) => {
        const next = { ...prev };
        for (const [bp, mql] of mediaQueryLists) {
          next[bp] = mql.matches;
        }
        return next;
      });
    };

    handleChange();

    mediaQueryLists.forEach(([, mql]) => mql.addEventListener("change", handleChange));
    return () => {
      mediaQueryLists.forEach(([, mql]) => mql.removeEventListener("change", handleChange));
    };
  }, []);

  let result: T | undefined = values.base;
  for (const [bp] of ORDERED_BREAKPOINTS) {
    if (matches[bp] && bp in values) {
      result = values[bp];
    }
  }

  return result;
}