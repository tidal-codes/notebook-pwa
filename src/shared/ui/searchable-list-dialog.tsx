import * as React from "react";

import { X } from "lucide-react";
import { Dialog, DialogContent } from "./dialog";

export type DialogItem = {
  id: string | null;
  title: string;
};

interface SearchableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchPlaceholder?: string;
  items: DialogItem[];
  onSelect: (id: string | null) => void;
  onCreate: (title: string) => void;
}

export function SearchableListDialog({
  open,
  onOpenChange,
  searchPlaceholder = "Type a folder...",
  items,
  onSelect,
  onCreate,
}: SearchableDialogProps) {
  const [searchValue, setSearchValue] = React.useState("");

  // فیلتر کردن آیتم‌ها بر اساس متن سرچ شده
  const filteredItems = React.useMemo(() => {
    if (!searchValue.trim()) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [items, searchValue]);

  // مدیریت زدن دکمه Enter برای ساخت آیتم جدید
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      searchValue.trim() !== "" &&
      filteredItems.length === 0
    ) {
      onCreate(searchValue.trim());
      setSearchValue(""); // پاک کردن سرچ بعد از ساخت
      onOpenChange(false); // بستن دیالوگ
    }
  };

  // مدیریت کلیک روی دکمه ساخت دستی
  const handleCreateClick = () => {
    if (searchValue.trim() !== "") {
      onCreate(searchValue.trim());
      setSearchValue("");
      onOpenChange(false);
    }
  };

  const handleSelect = (id: string | number) => {
    onSelect(id);
    setSearchValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 
        نکته: کلاس‌های داخل DialogContent برای استایل‌دهی شبیه به عکس‌های شما تنظیم شده‌اند. 
        کلاس [&>button]:hidden دکمه close پیش‌فرض shadcn را مخفی میکند تا دکمه کاستوم خودمان را بگذاریم.
      */}
      <DialogContent className="max-w-xl p-0 gap-0 bg-[#1e1e1e] border-zinc-800 text-zinc-200 [&>button]:hidden shadow-2xl">
        {/* هدر شامل اینپوت سرچ و دکمه بستن */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-500"
            autoFocus
          />
          <button
            onClick={() => onOpenChange(false)}
            className="ml-2 p-1 rounded-full bg-zinc-700/50 hover:bg-zinc-700 text-zinc-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* بدنه شامل لیست یا حالت خالی */}
        <div className="max-h-[350px] overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            // رندر کردن لیست آیتم‌ها
            <div className="flex flex-col gap-0.5">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-zinc-800 transition-colors text-zinc-300"
                >
                  {item.title}
                </button>
              ))}
            </div>
          ) : (
            // حالت Empty State (دقیقاً مشابه عکس دوم)
            <div className="flex flex-col items-center justify-center py-4 px-2">
              <button
                onClick={handleCreateClick}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 rounded-md text-sm transition-colors mb-4"
              >
                <span className="truncate pr-4">{searchValue}</span>
                <span className="text-zinc-400 shrink-0">Enter to create</span>
              </button>
              <p className="text-sm text-zinc-400">
                No existing folders found.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
