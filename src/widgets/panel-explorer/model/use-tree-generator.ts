import { useMemo } from "react";
import type { TreeNode } from "./types";
import type { NoteEntity } from "@/entities/note/model/types";
import type { FolderEntity } from "@/entities/folder/model/types";

interface Params {
  entities: (NoteEntity | FolderEntity)[];
}

interface Result {
  tree: TreeNode[];
  orderedIds: string[];
}

export function useTreeGenerator({ entities }: Params): Result {
  return useMemo(() => {
    const folderNodeMap = new Map<string, TreeNode & { type: "folder" }>();

    // پاس اول: فقط ساخت نودهای فولدر (ترتیب اینجا مهم نیست)
    for (const entity of entities) {
      if (entity.type === "folder") {
        folderNodeMap.set(entity.id, {
          type: "folder",
          id: entity.id,
          name: entity.name,
          parent_id: entity.parent_id,
          flatOrder: 0,
          children: [],
        });
      }
    }

    const roots: TreeNode[] = [];

    // پاس دوم: یک بار روی آرایه‌ی سورت‌شده (فولدر و نوت با هم)
    // چون به ترتیب سورت push می‌کنیم، children هر نود هم به همون ترتیب می‌مونه
    for (const entity of entities) {
      const node: TreeNode =
        entity.type === "folder"
          ? folderNodeMap.get(entity.id)!
          : {
              type: "note",
              id: entity.id,
              name: entity.name,
              parent_id: entity.parent_id,
              flatOrder: 0,
            };

      if (entity.parent_id === null) {
        roots.push(node);
      } else {
        const parent = folderNodeMap.get(entity.parent_id);
        parent ? parent.children.push(node) : roots.push(node);
      }
    }

    // این بخش دست‌نخورده می‌مونه؛ چون roots و children از قبل سورت شدن
    // پیمایش pre-order هم به همون ترتیب orderedIds رو می‌سازه
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
  }, [entities]);
}
