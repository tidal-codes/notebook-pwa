import type {
  NoteSearchResult,
  SearchMatch,
} from "@/features/search/global-search/model/types";
import { SearchResultItem } from "./search-result-item";
import { Button, buttonVariants } from "@/shared/ui/button";
import { ChevronDown } from "lucide-react";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";

interface Props {
  searchResults: NoteSearchResult[];
  onOpenMatch: (noteId: string, match: SearchMatch) => void;
}

export default function SearchResultsList({
  searchResults,
  onOpenMatch,
}: Props) {
  if (searchResults.length === 0) {
    return <p>no matches found</p>;
  }
  return searchResults.map((result) => {
    return (
      <section key={result.noteId}>
        <div
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "relative w-full justify-between",
          )}
        >
          <Button
            className="absolute inset-0 hover:bg-transparent!"
            variant="ghost"
          />
          <div className="flex items-center">
            <Button size="icon-sm" variant="ghost">
              <ChevronDown />
            </Button>
            <p className="text-sm">{result.title}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {result.matches.length}
          </p>
        </div>
        <ul>
          {result.matches.map((match, i) => (
            <>
              <SearchResultItem
                key={match.matchId}
                match={match}
                onClick={() => {}}
              />
              {i !== result.matches.length - 1 && <Separator />}
            </>
          ))}
        </ul>
      </section>
    );
  });
}
