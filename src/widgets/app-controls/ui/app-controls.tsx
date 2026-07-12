import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import ToggleThemeButton from "./toggle-theme-button";
import { RefreshCcw, Settings, User, LayoutGrid } from "lucide-react";

interface Props {
  variant: "sidebar" | "header";
}

export default function AppControls({ variant }: Props) {
  const isSidebar = variant === "sidebar";

  const extraButton = (
    <Button size="icon-lg">
      <LayoutGrid />
    </Button>
  );

  const settingsButton = (
    <Button size="icon-lg">
      <Settings />
    </Button>
  );

  return (
    <div
      className={cn(
        "flex justify-between items-center border-e",
        isSidebar ? "h-full flex-col" : "w-full",
      )}
    >
      <div className="flex flex-col">
        {isSidebar && <div className="bg-card p-2">{extraButton}</div>}
        <Separator />
        <div
          className={cn(
            "flex-1 flex items-center justify-between",
            isSidebar ? "flex-col" : "",
          )}
        >
          <div>
            <Avatar size="lg">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div
            className={cn(
              "flex items-center gap-3",
              isSidebar ? "flex-col" : "",
            )}
          >
            <ToggleThemeButton />
            <Button size="icon-lg">
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
          {settingsButton}
          {!isSidebar && extraButton}
        </div>
      </div>
    </div>
  );
}
