import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { selectIsAppSidebarOpen } from "@/shared/model/app-ui.selectors";
import { toggleAppSidebar } from "@/shared/model/app-ui.store";
import { Button } from "@/shared/ui/button";
import { SidebarClose, SidebarOpen } from "lucide-react";

export default function SidebarToggleButton() {
  const isSidebarOpen = useAppSelector(selectIsAppSidebarOpen);
  const dispatch = useAppDispatch();
  function handleToggleSidebar() {
    dispatch(toggleAppSidebar());
  }
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      className="text-muted-foreground"
      onClick={handleToggleSidebar}
    >
      {isSidebarOpen ? <SidebarClose /> : <SidebarOpen />}
    </Button>
  );
}
