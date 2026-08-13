"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { VoiceModal } from "@/components/VoiceModal";

type VoiceModalContext = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const Ctx = createContext<VoiceModalContext>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function useVoiceModal() {
  return useContext(Ctx);
}

export function VoiceModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {isOpen && <VoiceModal onClose={close} />}
    </Ctx.Provider>
  );
}
