import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";
import { useMemo } from "react";
import type { TreeNode } from "./types";

interface Params {
  folders: FolderEntity[];
  notes: NoteEntity[];
}

interface Result {
  tree: TreeNode[];
  orderedIds: string[];
}

export function useTreeGenerator({ folders, notes }: Params): Result {
  return useMemo(() => {
    const folderNodeMap = new Map<string, TreeNode & { type: "folder" }>();

    for (const folder of folders) {
      folderNodeMap.set(folder.id, {
        type: "folder",
        id: folder.id,
        name: folder.name,
        parent_id: folder.parent_id,
        flatOrder: 0,
        children: [],
      });
    }

    const roots: TreeNode[] = [];

    for (const folder of folders) {
      const node = folderNodeMap.get(folder.id)!;
      if (folder.parent_id === null) {
        roots.push(node);
      } else {
        const parent = folderNodeMap.get(folder.parent_id);
        parent ? parent.children.push(node) : roots.push(node);
      }
    }

    for (const note of notes) {
      const noteNode: TreeNode = {
        type: "note",
        id: note.id,
        name: note.name,
        parent_id: note.parent_id,
        flatOrder: 0,
      };

      if (note.parent_id === null) {
        roots.push(noteNode);
      } else {
        const parent = folderNodeMap.get(note.parent_id);
        parent ? parent.children.push(noteNode) : roots.push(noteNode);
      }
    }

    // یک پیمایش واحد: هم order رو روی نود ست می‌کنه، هم orderedIds رو می‌سازه
    const orderedIds: string[] = [];
    let counter = 0;

    function assignOrder(nodes: TreeNode[]) {
      for (const node of nodes) {
        node.flatOrder = counter++;
        orderedIds.push(node.id);
        if (node.type === "folder") {
          assignOrder(node.children);
        }
      }
    }

    assignOrder(roots);

    return { tree: roots, orderedIds };
  }, [folders, notes]);
}
