import type { SearchMatch } from "@/features/search/global-search/model/types";


interface SearchResultItemProps {
  match: SearchMatch;
  onClick: () => void;
}

export function SearchResultItem({ match, onClick }: SearchResultItemProps) {
  const before = match.preview.slice(0, match.previewMatchStart);
  const matched = match.preview.slice(
    match.previewMatchStart,
    match.previewMatchEnd,
  );
  const after = match.preview.slice(match.previewMatchEnd);

  return (
    <li className="bg-background">
      <button
        type="button"
        onClick={onClick}
        className="w-full px-3 py-2 text-start text-xs leading-relaxed text-muted-foreground hover:bg-muted"
      >
        {before}
        <mark className="rounded-sm bg-yellow-200/70 px-0.5 text-foreground dark:bg-yellow-500/30">
          {matched}
        </mark>
        {after}
      </button>
    </li>
  );
}
