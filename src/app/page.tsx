"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/app-store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OnboardingTip } from "@/components/onboarding-tip";
import { AuthDialog } from "@/components/auth-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { api, timeAgo } from "@/lib/client";
import { QuotesView } from "@/components/views/quotes-view";
import { QuizView } from "@/components/views/quiz-view";
import { Heart, BookOpen, MessageCircle, Sparkles, Quote } from "lucide-react";

function FeedPlaceholder() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ posts: any[] }>("/api/posts?page=1")
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground text-center py-12">Loading feed…</p>;
  if (!posts.length) {
    return (
      <div className="text-center py-16 space-y-3">
        <Heart className="h-10 w-10 text-primary/40 mx-auto" />
        <p className="text-muted-foreground">No posts yet. Be the first to share.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <Card key={p.id}>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Avatar
              username={p.author?.username || "?"}
              color={p.author?.avatarColor || "rose"}
              size={36}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{p.author?.username}</p>
              <p className="text-xs text-muted-foreground">
                {timeAgo(p.createdAt)} · {p.category}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-1">{p.title}</h3>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-4">{p.content}</p>
            <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
              <span>{p._count?.likes ?? 0} likes</span>
              <span>{p._count?.comments ?? 0} comments</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ViewShell({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const { status } = useSession();
  const { view, setAuthOpen } = useAppStore();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    async function tick() {
      try {
        const data = await api<{ conversations?: { unread: number }[] }>("/api/messages");
        if (active && data.conversations) {
          setUnread(data.conversations.reduce((s, c) => s + (c.unread || 0), 0));
        }
      } catch {}
    }
    tick();
    const id = setInterval(tick, 20000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader unreadCount={unread} />
      <main className="flex-1">
        {view === "feed" && (
          <ViewShell title="Community Feed" icon={Heart}>
            <FeedPlaceholder />
          </ViewShell>
        )}
        {view === "journal" && (
          <ViewShell title="Journal" icon={BookOpen}>
            <p className="text-muted-foreground">Private mood journal — sign in to use fully.</p>
          </ViewShell>
        )}
        {view === "messages" && (
          <ViewShell title="Messages" icon={MessageCircle}>
            <p className="text-muted-foreground">Direct messages appear here when you are signed in.</p>
          </ViewShell>
        )}
        {view === "quiz" && <QuizView />}
        {view === "quotes" && <QuotesView />}
        {view === "admin" && (
          <ViewShell title="Admin" icon={Heart}>
            <p className="text-muted-foreground">Admin tools require an ADMIN account.</p>
          </ViewShell>
        )}
      </main>
      <SiteFooter />
      <OnboardingTip />
      <AuthDialog />
      {status === "unauthenticated" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <Button onClick={() => setAuthOpen(true)} className="shadow-lg">
            Join Heartfelt
          </Button>
        </div>
      )}
    </div>
  );
}
