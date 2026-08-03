import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type SafeUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  bio: string | null;
  avatarColor: string;
};

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      bio: true,
      avatarColor: true,
    },
  });
  return user;
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
