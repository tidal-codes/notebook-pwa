import type { Tab } from "@/entities/tabs/model/types";
import TabItemContainer from "./tab-item-container";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import useAddNewTab from "@/features/tabs/use-add-new-tab";

interface Props {
  tabs: Tab[];
}

export default function TabList({ tabs }: Props) {
  const { handleAddNewTab } = useAddNewTab();

  return (
    <div className="flex w-full items-center gap-2">
      <div className="min-w-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex overflow-hidden">
            {tabs.map((tab) => (
              <TabItemContainer key={tab.id} id={tab.id} />
            ))}
          </div>

          <ScrollBar orientation="horizontal" className="z-100"/>
        </ScrollArea>
      </div>

      <Button variant="ghost" size="icon-sm" onClick={handleAddNewTab} className="shrink-0">
        <Plus />
      </Button>
    </div>
  );
}