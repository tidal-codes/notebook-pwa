import { useEffect } from "react";

type Options = {
  key?: string;
  code?: KeyboardEvent["code"];
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
};

export function useKeyboardShortcut({
  key,
  code,
  ctrl,
  shift,
  alt,
  meta,
  callback,
}: Options) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const keyMatch =
        key === undefined || e.key.toLowerCase() === key.toLowerCase();

      const codeMatch = code === undefined || e.code === code;

      const modifiersMatch =
        !!ctrl === e.ctrlKey &&
        !!shift === e.shiftKey &&
        !!alt === e.altKey &&
        !!meta === e.metaKey;

      if (!(keyMatch && codeMatch && modifiersMatch)) return;

      e.preventDefault();
      callback();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [key, code, ctrl, shift, alt, meta, callback]);
}
