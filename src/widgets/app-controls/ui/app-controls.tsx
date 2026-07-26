import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import ToggleThemeButton from "./toggle-theme-button";
import {
  RefreshCcw,
  User,
  SidebarClose,
} from "lucide-react";

interface Props {
  variant: "sidebar" | "header";
}

export default function AppControls({ variant }: Props) {
  const isSidebar = variant === "sidebar";

  const extraButton = (
    <Button size="icon-sm" variant="ghost" className="text-muted-foreground">
      <SidebarClose />
    </Button>
  );

  return (
    <div
      className={cn(
        "flex justify-between items-center border-e bg-sidebar",
        isSidebar ? "h-full flex-col" : "w-full",
      )}
    >
      <div className="flex flex-col">
        {isSidebar && <div className="bg-popover p-1 flex items-center justify-center">{extraButton}</div>}
        <div
          className={cn(
            "flex-1 flex items-center justify-between px-2",
            isSidebar && "flex-col gap-4 py-3",
          )}
        >
          <div>
            <Avatar size="default">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div
            className={cn(
              "flex items-center gap-3 ",
              isSidebar ? "flex-col" : "",
            )}
          >
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

        <div
          className={cn(
            "flex items-center",
            isSidebar ? "flex-col gap-3" : "gap-3",
          )}
        >
          {!isSidebar && extraButton}
        </div>
      </div>
    </div>
  );
}
