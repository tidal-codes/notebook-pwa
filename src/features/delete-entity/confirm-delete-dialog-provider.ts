import { createDialogContext } from "@/shared/lib/create-dialog-context";
import type { ConfirmDeleteDialogData } from "./types";

export const {
  Provider: ConfirmDeleteDialogProvider,
  useDialogActions: useConfirmDeleteDialogActions,
  useDialogData: useConfirmDeleteDialogData,
  useDialogOpen: useConfirmDeleteDialogOpen,
} = createDialogContext<ConfirmDeleteDialogData>();
