import type { Tab } from "@/entities/tabs/model/types";
import TabItem from "./tab-item-container";
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
      <div className="min-w-0 flex-1">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex">
            {tabs.map((tab) => (
              <TabItem key={tab.id} id={tab.id} />
            ))}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Button size="icon-lg" onClick={handleAddNewTab} className="shrink-0">
        <Plus />
      </Button>
    </div>
  );
}
