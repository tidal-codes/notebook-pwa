import { useCallback } from "react";

export function useMergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
) {
  return useCallback(
    (node: T) => {
      for (const ref of refs) {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref && typeof ref === "object") {
          (ref as React.MutableRefObject<T>).current = node;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}