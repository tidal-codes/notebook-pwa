import { createDialogContext } from "@/shared/lib/create-dialog-context";
import type { MoveEntityDialogData } from "./type";

export const {
  Provider: MoveEntityDialogProvider,
  useDialogActions: useMoveEntityDialogActions,
  useDialogData: useMoveEntityDialogData,
  useDialogOpen: useMoveEntityDialogOpen,
} = createDialogContext<MoveEntityDialogData>();
