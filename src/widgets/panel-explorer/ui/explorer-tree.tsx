import type { TreeNode } from "../model/types";
import TreeFolderItem from "./tree-folder-item";
import TreeNoteItem from "./tree-note-item";



interface Props {
  treeNodes: TreeNode[];
  depth?: number;
}

export default function ExplorerTree({ treeNodes, depth = 0 }: Props) {


  return (
    <>
      {treeNodes.map((node) => {
        if (node.type === "note") {
          return <TreeNoteItem key={node.id} id={node.id} depth={depth} />;
        }

        return (
          <TreeFolderItem
            key={node.id}
            id={node.id}
            depth={depth}
          >
            <ExplorerTree treeNodes={node.children} depth={depth + 1} />
          </TreeFolderItem>
        );
      })}
    </>
  );
}
