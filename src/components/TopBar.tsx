import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const TopBar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 glass-surface border-b border-border">
      <div className="flex items-center justify-between h-[var(--nav-height)] px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-display font-bold">
          <span className="gradient-text">StoryVerse</span>
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
