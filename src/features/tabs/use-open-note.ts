import {
  noteOpenedInActiveTab,
  noteOpenedInNewTab,
} from "@/entities/tabs/model/slice";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { useCallback } from "react";

export default function useOpenNote() {
  const dispatch = useAppDispatch();
  const handleOpenNote = useCallback(
    (noteId: string, mode: "NEW_TAB" | "ACTIVE_TAB" = "ACTIVE_TAB") => {
      if (mode === "ACTIVE_TAB") {
        dispatch(noteOpenedInActiveTab({ noteId }));
      } else {
        dispatch(noteOpenedInNewTab({ noteId }));
      }
    },
    [dispatch],
  );

  return { handleOpenNote };
}
