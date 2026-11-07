import { LogOut } from "lucide-react";
import { Logo } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-me";

export function AppHeader({
  name,
  subtitle,
}: {
  name?: string | null | undefined;
  subtitle: string;
}) {
  const signOut = useSignOut();
  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="text-xs font-medium text-muted-foreground">{subtitle}</div>
        </div>
        <div className="flex items-center gap-3">
          {name && <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>}
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-1 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
