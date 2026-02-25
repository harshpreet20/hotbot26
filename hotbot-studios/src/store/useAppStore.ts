"use client";
import { create } from "zustand";

interface AppState {
  // Form modal
  formOpen: boolean;
  formType: string;
  formPage: string;
  openForm: (type?: string, page?: string) => void;
  closeForm: () => void;

  // Chat
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  formOpen: false,
  formType: "get-started",
  formPage: "unknown",
  openForm: (type = "get-started", page = "unknown") =>
    set({ formOpen: true, formType: type, formPage: page }),
  closeForm: () => set({ formOpen: false }),

  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
}));
