import { useGlobalSearch } from "@/features/search/global-search/model/use-global-search";
import { SearchBox } from "./search-box";
import SearchResultControl from "./search-result-control";
import SearchResultsList from "./search-results-list";

export default function SearchPanel() {
  const globalSearch = useGlobalSearch();

  return (
    <div className="flex flex-col w-full h-full p-3">
      <SearchBox
        query={globalSearch.query}
        matchCase={globalSearch.matchCase}
        onQueryChange={globalSearch.setQuery}
        onMatchCaseChange={globalSearch.setMatchCase}
      />
      <div className="py-4">
        <SearchResultControl searchResults={globalSearch.results} />
      </div>
      <SearchResultsList
        searchResults={globalSearch.results}
        onOpenMatch={() => {}}
      />
    </div>
  );
}
