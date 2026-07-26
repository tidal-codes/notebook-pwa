import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/ui/resizable";
import AppPanel from "@/widgets/app-panel";
import EditorArea from "@/widgets/editor-area";
import PanelDrawer from "./panel-drawer";
import { useBreakpointValue } from "@/shared/lib/use-breakpoint-value";

export default function MainPanel() {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  if (!isDesktop) {
    return (
      <>
        <PanelDrawer />
        <div className="w-full flex flex-1">
          <EditorArea />
        </div>
      </>
    );
  }

  return (
    <ResizablePanelGroup className="flex-1">
      <ResizablePanel>
        <AppPanel />
      </ResizablePanel>
      <ResizableHandle className="ring-primary data-[separator='hover']:ring-2  data-[separator='active']:ring-2" />
      <ResizablePanel>
        <EditorArea />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
