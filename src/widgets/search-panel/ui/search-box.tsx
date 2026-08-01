import { Button } from "@/shared/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { CaseSensitive, Search } from "lucide-react";

interface SearchBoxProps {
  query: string;
  onQueryChange: (value: string) => void;
  matchCase: boolean;
  onMatchCaseChange: (value: boolean) => void;
}

export function SearchBox({
  query,
  onQueryChange,
  matchCase,
  onMatchCaseChange,
}: SearchBoxProps) {
  return (
    <div className="">
      <InputGroup>
        <InputGroupInput
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="search in notes"
        />
        <InputGroupAddon align="inline-end">
          <Button
            size="icon-sm"
            variant={`${matchCase ? "default" : "ghost"}`}
            onClick={() => onMatchCaseChange(!matchCase)}
          >
            <CaseSensitive />
          </Button>
        </InputGroupAddon>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
