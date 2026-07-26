import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { RefreshCcw, SidebarOpen, User } from "lucide-react";
import ToggleThemeButton from "./toggle-theme-button";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { openAppDrawer } from "@/shared/model/app-ui.store";

export default function AppControlsHeader() {
  const dispatch = useAppDispatch();
  function handleOpenAppPanel() {
    dispatch(openAppDrawer());
  }
  return (
    <div className="w-full flex items-center justify-between px-3 py-1.5">
      <Button size="icon-lg" variant="ghost" onClick={handleOpenAppPanel}>
        <SidebarOpen />
      </Button>
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-lg"
            className="text-muted-foreground"
          >
            <RefreshCcw />
          </Button>
          <ToggleThemeButton />
          <Avatar size="default">
            <AvatarImage src={undefined} />
            <AvatarFallback>
              <User className="size-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
