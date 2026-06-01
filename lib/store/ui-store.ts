import { create } from "zustand";

/**
 * Ephemeral UI state only — modals, map highlights, wizard steps.
 * Server entities belong in TanStack Query (see CURSOR_RULES.md).
 */
type UiState = {
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
}));
