import { notesQueryOptions } from "@/entities/note/api/note.queries";
import {
  makeSelectTabById,
  selectActiveTab,
} from "@/entities/tabs/model/selectors";
import TabItem from "@/entities/tabs/ui/tab-item";
import useChangeActiveTab from "@/features/tabs/use-change-active-tab";
import useCloseTab from "@/features/tabs/use-close-tab";
import { useAppSelector } from "@/shared/config/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

interface Props {
  id: string;
}

export default function TabItemContainer({ id }: Props) {
  const selectTabById = useMemo(() => makeSelectTabById(id), [id]);
  const tab = useAppSelector(selectTabById);
  const { data: note } = useQuery({
    ...notesQueryOptions,
    enabled: !!tab,
    select: (data) =>
      data.find(
        (note) => note.id === tab?.entries[tab.activeEntryIndex].noteId,
      ),
  });
  const activeTab = useAppSelector(selectActiveTab);
  const { handleChangeActiveTab } = useChangeActiveTab();
  const { handleCloseTab } = useCloseTab();

  const handleOnClick = useCallback(() => {
    handleChangeActiveTab(id);
  }, []);

  const handleOnClose = useCallback(() => {
    handleCloseTab(id);
  }, []);

  return (
    <TabItem
      title={note?.name || "new tab"}
      isActive={activeTab.id === id}
      onClick={handleOnClick}
      onClose={handleOnClose}
    />
  );
}
