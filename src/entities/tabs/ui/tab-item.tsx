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
        "group relative flex min-w-0 max-w-48 cursor-pointer select-none items-center justify-between gap-2 px-3 py-2 text-sm",
        isActive
          ? "bg-background text-muted-foreground hover:text-foreground"
          : "bg-panel text-foreground",
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
          "shrink-0 rounded p-0.5 transition-opacity hover:bg-accent",
        )}
      >
        <X className="size-3.5" />
      </button>

      {isActive && (
        <span
          aria-hidden
          className="absolute -bottom-px left-0 right-0 h-px bg-panel"
        />
      )}
    </div>
  );
}
