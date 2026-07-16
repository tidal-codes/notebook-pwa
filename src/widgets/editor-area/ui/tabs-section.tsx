import { useAppSelector } from "@/shared/config/store/hooks";
import TabList from "./tab-list";
import { selectAllTabs } from "@/entities/tabs/model/selectors";


export default function TabsSection() {
  const tabs = useAppSelector(selectAllTabs);
  return (
    <div className="w-full bg-card">
      <TabList tabs={tabs}/>
    </div>
  );
}
