import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Props {
  title: string;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

export default function TabItem({ title, isActive, onClick, onClose }: Props) {
  return (
    <div
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      className={cn(
        "group relative flex min-w-0 max-w-48 cursor-pointer select-none items-center justify-between gap-2 px-3 h-8 text-sm transition-colors",
        isActive
          ? "z-10 rounded-t-md bg-background text-foreground"
          : "rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span className="truncate">{title}</span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={`بستن ${title}`}
        className={cn(
          "shrink-0 rounded p-0.5 opacity-100 transition-opacity hover:bg-accent sm:opacity-0 sm:group-hover:opacity-100",
          isActive && "sm:opacity-100",
        )}
      >
        <X className="size-3.5" />
      </button>

      {isActive && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 bottom-0 size-2 bg-background [mask-image:radial-gradient(circle_at_top_left,transparent_8px,white_8px)] [-webkit-mask-image:radial-gradient(circle_at_top_left,transparent_8px,white_8px)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-2 bottom-0 size-2 bg-background [mask-image:radial-gradient(circle_at_top_right,transparent_8px,white_8px)] [-webkit-mask-image:radial-gradient(circle_at_top_right,transparent_8px,white_8px)]"
          />
        </>
      )}
    </div>
  );
}
