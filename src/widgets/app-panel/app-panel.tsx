import PanelExplorer from "../panel-explorer";
import useAppPanel from "./use-app-panel";
import { Button } from "@/shared/ui/button";
import { FolderClosed, Search, X } from "lucide-react";
import Tooltip from "@/shared/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { closeAppDrawer } from "@/shared/model/app-ui.store";

const panelItems = [
  {
    title: "explorer",
    href: "/explorer",
    icon: FolderClosed,
  },
  {
    title: "search",
    href: "/search",
    icon: Search,
  },
];

interface Props {
  isDrawer?: boolean;
}

export default function AppPanel({ isDrawer = false }: Props) {
  const { panel } = useAppPanel();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  function handleCloseAppPanel() {
    dispatch(closeAppDrawer());
  }

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
        {isDrawer ? (
          <div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCloseAppPanel}
            >
              <X />
            </Button>
          </div>
        ) : null}
      </div>
      <div className="flex-1 min-h-0">
        {panel === "explorer" ? <PanelExplorer /> : null}
      </div>
    </div>
  );
}
