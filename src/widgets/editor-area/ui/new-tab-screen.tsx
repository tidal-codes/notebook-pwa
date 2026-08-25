import useCloseTab from "@/features/tabs/use-close-tab";
import { useGoToActions } from "./go-to-dialog-provider";

interface Props {
  activeTabId: string;
}

export default function NewTabScreen({ activeTabId }: Props) {
  const { handleCloseTab } = useCloseTab();
  const { showDialog } = useGoToActions();
  return (
    <div className="absolute top-[50%] left-[50%] translate-[-50%] flex items-center justify-center">
      <div className="text-lg text-center capitalize text-primary">
        <p
          className="whitespace-nowrap cursor-pointer hover:underline"
          onClick={() => showDialog({})}
        >
          go to file or create new note
        </p>
        <p
          className="hover:underline cursor-pointer"
          onClick={() => handleCloseTab(activeTabId)}
        >
          close
        </p>
      </div>
    </div>
  );
}
