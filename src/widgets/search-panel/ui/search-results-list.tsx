import type {
  NoteSearchResult,
  SearchMatch,
} from "@/features/search/global-search/model/types";
import { SearchResultItem } from "./search-result-item";

import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  searchResults: NoteSearchResult[];
  onOpenMatch: (
    noteId: string,
    match: SearchMatch,
    source: "content" | "title",
  ) => void;
  handleOpenMatchNote: (noteId: string) => void;
}

export default function SearchResultsList({
  searchResults,
  onOpenMatch,
  handleOpenMatchNote,
}: Props) {
  const [collapsed, setCollapsed] = useState(true);

  if (searchResults.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        No results found.
      </div>
    );
  }

  return (
    <>
      {searchResults.map((result) => (
        <Collapsible
          key={result.noteId}
          open={collapsed}
          onOpenChange={setCollapsed}
          className="w-full p-3"
        >
          {/* کانتینر اصلی هدر که افکت هاور یکپارچه به کل ردیف می‌دهد */}
          <div className="flex w-full items-center rounded-md transition-colors hover:bg-accent/50">
            {/* 1. بخش تاگل (فقط با کلیک روی این دکمه کولپس باز/بسته می‌شود) */}
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="bg-transparent hover:bg-transparent"
              >
                {collapsed ? <ChevronDown /> : <ChevronRight />}
              </Button>
            </CollapsibleTrigger>

            {/* 2. بخش محتوا (با کلیک روی عنوان یا عدد، فقط متد نوت اجرا می‌شود) */}
            <Button
              variant="ghost"
              className="flex flex-1 items-center justify-between px-2 hover:bg-transparent"
              onClick={() => handleOpenMatchNote(result.noteId)}
            >
              <span className="truncate text-sm font-medium">
                {result.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {result.matches.length}
              </span>
            </Button>
          </div>

          <CollapsibleContent>
            <ul>
              {result.matches.map((match, index) => (
                <li key={match.matchId}>
                  <SearchResultItem
                    match={match}
                    onClick={() =>
                      onOpenMatch(result.noteId, match, match.source)
                    }
                  />

                  {index !== result.matches.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </>
  );
}
