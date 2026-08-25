import { createDialogContext } from "@/shared/lib/create-dialog-context";

export const {
    Provider: GoToDialogProvider,
    useDialogActions: useGoToActions,
    useDialogData: useGoToData,
    useDialogOpen: useGoToOpen
} = createDialogContext();