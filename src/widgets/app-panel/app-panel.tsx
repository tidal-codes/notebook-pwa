import { Separator } from "@/shared/ui/separator";
import PanelExplorer from "../panel-explorer";
import useAppPanel from "./use-app-panel";
import { Button } from "@/shared/ui/button";
import { Bookmark, CircleX, FolderClosed, Search, SidebarClose } from "lucide-react";
import Tooltip from "@/shared/ui/tooltip";
import { useNavigate } from "react-router-dom";

const panelItems = [
  {
    title: "files",
    href: "/explorer",
    icon: FolderClosed,
  },
  {
    title: "search",
    href: "/search",
    icon: Search,
  },
  {
    title: "bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
  },
];

interface Props {
  isDrawer?: boolean;
}

export default function AppPanel({ isDrawer = false }: Props) {
  const { panel } = useAppPanel();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-sidebar">
      <div className="flex items-center justify-between gap-1.5 bg-popover px-5 py-1">
        <div className="flex items-center gap-1.5">
          {panelItems.map((item) => (
            <Tooltip key={item.title} content={item.title} side="bottom">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate(item.href)}
                className="text-muted-foreground"
              >
                <item.icon />
              </Button>
            </Tooltip>
          ))}
        </div>
        <div>
          <Button variant="ghost" size="icon-sm">
            <SidebarClose/>
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {panel === "explorer" ? (
          <PanelExplorer />
        ) : panel === "bookmarks" ? null : null}
      </div>
    </div>
  );
}
