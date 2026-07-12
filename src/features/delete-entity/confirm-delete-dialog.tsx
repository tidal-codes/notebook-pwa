import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/dialog";
import {
  useConfirmDeleteDialogActions,
  useConfirmDeleteDialogData,
  useConfirmDeleteDialogOpen,
} from "./confirm-delete-dialog-provider";
import { Button } from "@/shared/ui/button";
import useDeleteEntity from "./use-delete-entity";

export default function ConfirmDeleteDialog() {
  const { open } = useConfirmDeleteDialogOpen();
  const { hideDialog } = useConfirmDeleteDialogActions();
  const { defaultValues } = useConfirmDeleteDialogData();
  const { deleteEntity, isPending } = useDeleteEntity(
    defaultValues?.entityId ?? "",
    defaultValues?.entityType ?? "note",
  );

  const handleDelete = async () => {
    await deleteEntity();
    hideDialog();
  };
  return (
    <Dialog open={open} onOpenChange={(open) => !open && hideDialog()}>
      <DialogContent>
        <DialogHeader>
          <h3 className="text-lg font-semibold">
            delete {defaultValues?.entityType}
          </h3>
        </DialogHeader>
        <div>
          <p>
            Are you sure you want to delete {defaultValues?.entityName}? This
            action cannot be undone.
          </p>
          {defaultValues?.entityType === "folder" && (
            <p className="text-sm text-destructive mt-2">
              Deleting a folder will also delete all its contents.
            </p>
          )}
        </div>
        <div>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            className="mt-4 ml-2"
            onClick={() => hideDialog()}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
