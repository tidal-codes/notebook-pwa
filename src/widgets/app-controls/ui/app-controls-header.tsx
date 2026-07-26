import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Menu, RefreshCcw, User } from "lucide-react";
import ToggleThemeButton from "./toggle-theme-button";

export default function AppControlsHeader() {
  return (
    <div className="w-full flex items-center justify-between px-3 py-1.5">
      <Button size="icon-lg" variant="ghost">
        <Menu />
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
