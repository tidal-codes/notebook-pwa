import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import ToggleThemeButton from "./toggle-theme-button";
import { RefreshCcw, User, SidebarClose } from "lucide-react";

export default function AppControlsAside() {
  return (
    <div className="flex h-full flex-col items-center justify-between border-e bg-sidebar">
      <div className="flex shrink-0 items-center justify-center bg-popover px-2 py-1">
        <Button
          size="icon-sm"
          variant="ghost"
          className="text-muted-foreground"
        >
          <SidebarClose />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 py-3">
        <Avatar size="default">
          <AvatarImage src={undefined} />
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center gap-3">
          <ToggleThemeButton />
          <Button
            variant="ghost"
            size="icon-lg"
            className="text-muted-foreground"
          >
            <RefreshCcw />
          </Button>
        </div>
      </div>
    </div>
  );
}
