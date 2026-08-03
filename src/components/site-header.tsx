"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { Heart, LogOut, Search, Menu } from "lucide-react";
import { useAppStore, ViewKey } from "@/store/app-store";
import { cn } from "@/lib/utils";

const NAV: { key: ViewKey; label: string }[] = [
  { key: "feed", label: "Feed" },
  { key: "journal", label: "Journal" },
  { key: "messages", label: "Messages" },
  { key: "quiz", label: "Quiz" },
  { key: "quotes", label: "Quotes" },
];

export function SiteHeader({
  unreadCount = 0,
  onSearchClick,
}: {
  unreadCount?: number;
  onSearchClick?: () => void;
}) {
  const { data: session } = useSession();
  const { view, setView, setAuthOpen } = useAppStore();
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <button
          onClick={() => setView("feed")}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <span className="hidden sm:inline">Heartfelt</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.label}
              {item.key === "messages" && unreadCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setView("admin")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                view === "admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Admin
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {onSearchClick && (
            <Button variant="ghost" size="icon" onClick={onSearchClick} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          )}
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar username={user.username || user.name || "U"} color={user.avatarColor || "rose"} size={32} />
                <span className="hidden sm:inline text-sm font-medium">{user.username || user.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setAuthOpen(true)}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
