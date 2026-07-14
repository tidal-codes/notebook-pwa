export interface ConfirmDeleteDialogData {
  entities: Array<{
    id: string;
    type: "note" | "folder";
  }>;
}
