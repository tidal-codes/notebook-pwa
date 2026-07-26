import { useTheme } from "@/app/theme/theme-provider";
import { Button } from "@/shared/ui/button";
import { Moon, Sun } from "lucide-react";

export default function ToggleThemeButton() {
  const { theme, setTheme } = useTheme();
  function handleThemeToggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={handleThemeToggle}
      className="text-muted-foreground"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
