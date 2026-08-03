import { useCallback } from "react";
import { useGlobalSearch } from "@/features/search/global-search/model/use-global-search";
import type { SearchMatch } from "@/features/search/global-search/model/types";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { requestSpotlight } from "@/features/search/note-spotlight/model/note-spotlight-slice";
import useOpenNote from "@/features/tabs/use-open-note";
import { SearchBox } from "./search-box";
import SearchResultControl from "./search-result-control";
import SearchResultsList from "./search-results-list";

export default function SearchPanel() {
  const globalSearch = useGlobalSearch();
  const dispatch = useAppDispatch();
  const { handleOpenNote } = useOpenNote();

  const handleOnOpenMatch = useCallback(
    (noteId: string, match: SearchMatch, source: "content" | "title") => {
      handleOpenNote(noteId, "ACTIVE_TAB");

      if (source === "content") {
        console.log(match)
        dispatch(
          requestSpotlight({
            noteId,
            start: match.start,
            end: match.end,
          }),
        );
      }
    },
    [dispatch, handleOpenNote],
  );

  const handleOpenMatchNote = useCallback(
    (noteId: string) => {
      handleOpenNote(noteId, "ACTIVE_TAB");
    },
    [handleOpenNote],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* بخش ثابت بالا */}
      <div className="shrink-0 space-y-4 p-3">
        <SearchBox
          query={globalSearch.query}
          matchCase={globalSearch.matchCase}
          onQueryChange={globalSearch.setQuery}
          onMatchCaseChange={globalSearch.setMatchCase}
        />

        <SearchResultControl searchResults={globalSearch.results} />
      </div>

      <ScrollArea className="mt-2 flex-1 min-h-0">
        <SearchResultsList
          searchResults={globalSearch.results}
          onOpenMatch={handleOnOpenMatch}
          handleOpenMatchNote={handleOpenMatchNote}
        />
      </ScrollArea>
    </div>
  );
}
