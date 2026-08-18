import { Button } from "@/shared/ui/button";
import ToggleThemeButton from "./toggle-theme-button";
import { RefreshCcw } from "lucide-react";
import SidebarToggleButton from "./sidebar-toggle-button";

import UserAvatarMenu from "./user-avatar-menu";
import SyncButton from "./sync-button";

export default function AppControlsAside() {
  return (
    <div className="flex h-full flex-col items-center justify-between border-e bg-sidebar">
      <div className="flex shrink-0 items-center justify-center bg-popover px-2 py-1">
        <SidebarToggleButton />
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 py-3">
        <UserAvatarMenu />

        <div className="flex flex-col items-center gap-3">
          <ToggleThemeButton />
          <SyncButton />
        </div>
      </div>
    </div>
  );
}
