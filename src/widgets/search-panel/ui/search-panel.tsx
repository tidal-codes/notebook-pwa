import { useGlobalSearch } from "@/features/search/global-search/model/use-global-search";
import { SearchBox } from "./search-box";

export default function SearchPanel() {
  const globalSearch = useGlobalSearch();
  console.log("SEARCH RESULT" , globalSearch.results)
  return (
    <div className="flex flex-col w-full h-full p-3">
      <SearchBox
        query={globalSearch.query}
        matchCase={globalSearch.matchCase}
        onQueryChange={globalSearch.setQuery}
        onMatchCaseChange={globalSearch.setMatchCase}
      />
    </div>
  );
}
