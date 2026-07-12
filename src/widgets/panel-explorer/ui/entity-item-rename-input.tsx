import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";

export interface EntityItemRenameInputProps {
  title: string;
  onCommit: (value: string) => void;
  onCancel?: () => void;
}

export default function EntityItemRenameInput({
  title,
  onCommit,
  onCancel,
}: EntityItemRenameInputProps) {
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // پرچمی برای کنترل وضعیت و جلوگیری از اجرای کامیت‌های ناخواسته
  const skipCommitRef = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function commit() {
    // اگر پرچم فعال باشد، از کامیت کردن خودداری کن
    if (skipCommitRef.current) return;
    
    // پرچم را فعال می‌کنیم تا در صورت کلیک روی دکمه تایید، تابع دوبار پشت سر هم اجرا نشود
    skipCommitRef.current = true; 
    onCommit(draftTitle);
  }

  function cancel() {
    skipCommitRef.current = true;
    setDraftTitle(title);
    onCancel?.();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      inputRef.current?.blur();
    }
  }

  return (
    <InputGroup className="min-w-0 flex-1 border-0 bg-transparent outline-0 focus-visible:ring-0 focus-visible:ring-offset-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 dark:bg-transparent">
      <InputGroupInput
        ref={inputRef}
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="h-6 min-w-0 flex-1 border-none bg-transparent px-1 text-sm outline-0 focus-visible:ring-0 dark:bg-transparent"
      />
      <InputGroupAddon align="inline-end" className="z-10">
        <Button
          variant="ghost"
          size="icon-xs"
          // با رویدادهای مَوس و لمس، قبل از اینکه فوکوس خارج شود (Blur)، پرچم کنسل را فعال می‌کنیم
          onMouseDown={(e) => {
            e.stopPropagation();
            cancel();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            cancel();
          }}
        >
          <XCircle className="text-destructive" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            commit();
          }}
        >
          <CheckCircle2 className="text-success" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}