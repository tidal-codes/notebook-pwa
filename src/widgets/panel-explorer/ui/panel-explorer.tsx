import { useNotes } from "@/entities/note/api/note.queries";
import ExplorerTree from "./explorer-tree";
import { useFolders } from "@/entities/folder/api/folder.queries";
import { useTreeGenerator } from "../model/use-tree-generator";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import {
  selectLastAddedItemId,
  selectSelectedCount,
  selectSelectedEntities,
  selectSelectedEntitiesList,
  selectSemiSelectedItem,
} from "../model/explorer.selectors";
import ExplorerActionBar from "./explorer-action-bar";
import { Separator } from "@/shared/ui/separator";
import { useEffect } from "react";
import { buildEntityById } from "../lib/build-entity-by-id";
import { getEntityParents } from "../lib/get-entity-parents";
import { openAllFolders } from "../model/explorer-preferences.slice";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import ExplorerSelectionActionBar from "./explorer-selection-action-bar";
import { clearSelection } from "../model/explorer.slice";
import ExplorerTreeLoading from "./explorer-tree-loading";
import { useSortedEntities } from "../model/use-sorted-entities";
import { OrderedItemsProvider } from "../model/ordered-items-context";
import EntityDragDropProvider from "@/features/entity/entity-dnd/model/entity-dnd-provider";
import useMoveEntities from "@/features/entity/move-entity/use-move-entities";

export default function PanelExplorer() {
  const { isLoading: notes_loading, data: notes } = useNotes();
  const { isLoading: folders_loading, data: folders } = useFolders();

  const loading = notes_loading || folders_loading;

  const entities = useSortedEntities({
    folders: folders || [],
    notes: notes || [],
  });

  const { tree, orderedItems } = useTreeGenerator({ entities });

  const dispatch = useAppDispatch();

  const selectedCount = useAppSelector(selectSelectedCount);
  const selectedEntities = useAppSelector(selectSelectedEntities);
  const { moveEntities } = useMoveEntities();

  const semiSelectedItem = useAppSelector(selectSemiSelectedItem);
  const lastAddedItemId = useAppSelector(selectLastAddedItemId);

  function getParent() {
    if (!semiSelectedItem || semiSelectedItem.type === "note") return null;
    return semiSelectedItem.id;
  }

  useEffect(() => {
    const byId = buildEntityById(folders || [], notes || []);

    if (!lastAddedItemId || !byId.has(lastAddedItemId)) return;

    const FolderEntities = getEntityParents(lastAddedItemId, byId);

    dispatch(openAllFolders(FolderEntities.map((folder) => folder.id)));
  }, [lastAddedItemId, folders, notes]);

  return (
    <EntityDragDropProvider
      selectedEntities={selectedEntities}
      onMove={(entities, targetFolderId) =>
        moveEntities(entities, targetFolderId)
      }
    >
      <OrderedItemsProvider orderedItems={orderedItems}>
        <div className="flex flex-col h-full">
          {selectedCount > 0 ? (
            <ExplorerSelectionActionBar
              selectedCount={selectedCount}
              clearSelection={() => dispatch(clearSelection())}
            />
          ) : (
            <ExplorerActionBar
              isLoading={loading}
              currentParentFolderId={getParent()}
            />
          )}
          <Separator />
          {loading ? (
            <ExplorerTreeLoading />
          ) : (
            <ScrollArea className="flex-1 min-h-0 px-6 py-4">
              <ExplorerTree treeNodes={tree} />
              <ScrollBar />
            </ScrollArea>
          )}
        </div>
      </OrderedItemsProvider>
    </EntityDragDropProvider>
  );
}
