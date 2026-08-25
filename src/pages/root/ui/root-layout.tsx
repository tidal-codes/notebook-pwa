import { ConfirmDeleteDialogProvider } from "@/features/entity/delete-entity/confirm-delete-dialog-provider";
import ConfirmDeleteDialog from "@/features/entity/delete-entity/confirm-delete-dialog";
import { Toaster } from "@/shared/ui/sonner";
import MoveEntityDialog from "@/features/entity/move-entity/move-entity-dialog";
import { MoveEntityDialogProvider } from "@/features/entity/move-entity/move-entity-dialog-provider";
import AppControll from "./app-controll";
import MainPanel from "./main-panel";
import AuthDialog from "@/features/auth/ui/auth-dialog";
import { useAutoSync } from "@/features/sync/model/use-auto-sync";

export default function RootLayout() {
  useAutoSync();

  return (
      <ConfirmDeleteDialogProvider>
        <MoveEntityDialogProvider>
          <Toaster position="top-center" />
          <ConfirmDeleteDialog />
          <MoveEntityDialog />
          <AuthDialog />
          <div className="h-screen flex flex-col md:flex-row items-center">
            <AppControll />
            <MainPanel />
          </div>
        </MoveEntityDialogProvider>
      </ConfirmDeleteDialogProvider>
  );
}
