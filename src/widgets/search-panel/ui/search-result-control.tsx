import type { NoteSearchResult } from "@/features/search/global-search/model/types";
import { Separator } from "@/shared/ui/separator";

interface Props {
  searchResults: NoteSearchResult[];
}

export default function SearchResultControl({ searchResults }: Props) {
  const totalMatches = searchResults.reduce(
    (total, result) => total + result.matches.length,
    0,
  );
  if (totalMatches === 0) return null;
  return (
    <>
      <div className="w-full flex items-center">
        <p className="text-xs text-muted-foreground">{totalMatches} results found</p>
      </div>
      <Separator className="mt-4"/>
    </>
  );
}
