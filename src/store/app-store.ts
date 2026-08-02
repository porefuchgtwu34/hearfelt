"use client";

import { create } from "zustand";

export type ViewKey =
  | "feed"
  | "journal"
  | "messages"
  | "quiz"
  | "quotes"
  | "admin";

interface AppState {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
  onboardingDismissed: boolean;
  dismissOnboarding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "feed",
  setView: (view) => set({ view }),
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  authOpen: false,
  setAuthOpen: (authOpen) => set({ authOpen }),
  onboardingDismissed: false,
  dismissOnboarding: () => set({ onboardingDismissed: true }),
}));
