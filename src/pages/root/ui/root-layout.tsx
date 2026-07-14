import { type PropsWithChildren } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/shared/ui/resizable";
import AppControls from "@/widgets/app-controls/ui/app-controls";
import { ConfirmDeleteDialogProvider } from "@/features/delete-entity/confirm-delete-dialog-provider";
import ConfirmDeleteDialog from "@/features/delete-entity/confirm-delete-dialog";
import { Toaster } from "@/shared/ui/sonner";
import AppPanel from "@/widgets/app-panel";
import EditorArea from "@/widgets/editor-area";
import MoveEntityDialog from "@/features/move-entity/move-entity-dialog";
import { MoveEntityDialogProvider } from "@/features/move-entity/move-entity-dialog-provider";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <ConfirmDeleteDialogProvider>
      <MoveEntityDialogProvider>
        <Toaster />
        <ConfirmDeleteDialog />
        <MoveEntityDialog />
        <div className="h-screen flex items-center">
          <AppControls variant="sidebar" />
          <ResizablePanelGroup className="flex-1">
            <ResizablePanel>
              <AppPanel />
            </ResizablePanel>
            <ResizableHandle className="ring-primary data-[separator='hover']:ring-2  data-[separator='active']:ring-2" />
            <ResizablePanel>
              <EditorArea />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </MoveEntityDialogProvider>
    </ConfirmDeleteDialogProvider>
  );
}
