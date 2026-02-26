"use client";
import { create } from "zustand";

interface AppState {
  // Form modal
  formOpen: boolean;
  formType: string;
  formPage: string;
  openForm: (type?: string, page?: string) => void;
  closeForm: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  formOpen: false,
  formType: "get-started",
  formPage: "unknown",
  openForm: (type = "get-started", page = "unknown") =>
    set({ formOpen: true, formType: type, formPage: page }),
  closeForm: () => set({ formOpen: false }),
}));
