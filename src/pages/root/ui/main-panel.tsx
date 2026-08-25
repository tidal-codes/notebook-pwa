import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/ui/resizable";
import AppPanel from "@/widgets/app-panel";
import EditorArea from "@/widgets/editor-area";
import PanelDrawer from "./panel-drawer";
import { useBreakpointValue } from "@/shared/lib/use-breakpoint-value";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import {
  type Layout,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import { selectIsAppSidebarOpen } from "@/shared/model/app-ui.selectors";
import { useCallback, useEffect, useRef } from "react";
import { closeAppSidebar, openAppSidebar } from "@/shared/model/app-ui.store";
import EditorCanvas from "@/widgets/editor-canvas";

export default function MainPanel() {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(selectIsAppSidebarOpen);
  const appPanelRef = useRef<PanelImperativeHandle>(null);

  const isSyncingRef = useRef(false);

  const handleLayoutChanged = useCallback(
    (layout: Layout) => {
      if (isSyncingRef.current) return;

      const shouldBeOpen = layout.app_panel !== 0;
      if (shouldBeOpen === isSidebarOpen) return;

      dispatch(shouldBeOpen ? openAppSidebar() : closeAppSidebar());
    },
    [dispatch, isSidebarOpen],
  );

  useEffect(() => {
    const panel = appPanelRef.current;
    if (!panel) return;

    const isCollapsed = panel.isCollapsed();

    if (isSidebarOpen && isCollapsed) {
      isSyncingRef.current = true;
      panel.expand();
      isSyncingRef.current = false;
    } else if (!isSidebarOpen && !isCollapsed) {
      isSyncingRef.current = true;
      panel.collapse();
      isSyncingRef.current = false;
    }
  }, [isSidebarOpen]);

  if (!isDesktop) {
    return (
      <>
        <PanelDrawer />
        <div className="w-full flex flex-1">
          <EditorArea>
            {(note, onSave) => <EditorCanvas note={note} onSave={onSave} />}
          </EditorArea>
        </div>
      </>
    );
  }

  return (
    <ResizablePanelGroup
      className="flex-1"
      onLayoutChanged={handleLayoutChanged}
    >
      <ResizablePanel
        panelRef={appPanelRef}
        id="app_panel"
        collapsible
        collapsedSize={0}
        minSize="15"
        maxSize="100"
        defaultSize={20}
      >
        <AppPanel />
      </ResizablePanel>
      <ResizableHandle className="ring-primary data-[separator='hover']:ring-2 data-[separator='active']:ring-2" />
      <ResizablePanel id="editor_area">
        <EditorArea>
          {(note, onSave) => <EditorCanvas note={note} onSave={onSave} />}
        </EditorArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
