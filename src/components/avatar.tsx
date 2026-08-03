"use client";

import { cn } from "@/lib/utils";
import { initials } from "@/lib/client";

export function Avatar({
  username,
  color = "rose",
  size = 36,
  className,
}: {
  username: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "avatar-" + color,
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0 shadow-sm select-none",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials(username)}
    </div>
  );
}
