import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { ArrowDown, ArrowUp, CaseSensitive, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface InNoteSearchToolbarProps {
  noteId: string;
  tabId: string;
  term: string;
  matchCase: boolean;
  totalMatches: number;
  activeMatchIndex: number;
  onSearch: (term: string, matchCase: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

function makeLocalTermKey(noteId: string, tabId: string): string {
  return `${noteId}::${tabId}`;
}

export function InNoteSearchToolbar({
  noteId,
  tabId,
  term,
  matchCase,
  totalMatches,
  activeMatchIndex,
  onSearch,
  onNext,
  onPrevious,
  onClose,
}: InNoteSearchToolbarProps) {
  const key = makeLocalTermKey(noteId, tabId);
  const [localTerms, setLocalTerms] = useState<Record<string, string>>({
    [key]: term,
  });
  const localTerm = localTerms[key] ?? term;

  useEffect(() => {
    setLocalTerms((prev) =>
      prev[key] !== undefined ? prev : { ...prev, [key]: term },
    );
  }, [key, term]);

  const handleChange = (value: string) => {
    setLocalTerms((prev) => ({ ...prev, [key]: value }));
    onSearch(value, matchCase);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.shiftKey ? onPrevious() : onNext();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="flex items-center gap-1 w-full max-w-2xl px-5">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          value={localTerm}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="find"
          className=""
          autoFocus
        />
        <InputGroupAddon align="inline-end">
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {totalMatches > 0
              ? `${activeMatchIndex + 1} / ${totalMatches}`
              : "۰ / ۰"}
          </span>
        </InputGroupAddon>
      </InputGroup>

      <Button
        type="button"
        size="icon-sm"
        variant={matchCase ? "default" : "ghost"}
        onClick={() => onSearch(localTerm, !matchCase)}
        title="تطبیق حروف بزرگ/کوچک"
        aria-pressed={matchCase}
        className={`rounded px-1.5 py-0.5 text-xs font-medium`}
      >
        <CaseSensitive />
      </Button>

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        onClick={onPrevious}
        title="قبلی"
        className="rounded px-1 hover:bg-muted"
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        onClick={onNext}
        title="بعدی"
        className="rounded px-1 hover:bg-muted"
      >
        <ArrowDown />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        onClick={onClose}
        title="بستن"
        className="rounded px-1 hover:bg-muted"
      >
        <X />
      </Button>
    </div>
  );
}
