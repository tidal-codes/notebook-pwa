import { Separator } from "@/shared/ui/separator";
import PanelExplorer from "../panel-explorer";
import useAppPanel from "./use-app-panel";
import { Button } from "@/shared/ui/button";
import { Bookmark, FolderClosed, Search } from "lucide-react";
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

export default function AppPanel() {
  const { panel } = useAppPanel();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 bg-card px-5 py-2">
        {panelItems.map((item) => (
          <Tooltip key={item.title} content={item.title} side="bottom">
            <Button size="icon-lg" onClick={() => navigate(item.href)}>
              <item.icon />
            </Button>
          </Tooltip>
        ))}
      </div>
      <Separator />
      <div className="flex-1 min-h-0">
        {panel === "explorer" ? (
          <PanelExplorer />
        ) : panel === "bookmarks" ? null : null}
      </div>
    </div>
  );
}
