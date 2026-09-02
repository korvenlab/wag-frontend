import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { Button } from "../ui/button";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Só renderiza abaixo deste breakpoint (px). Desktop não monta o drawer. */
  maxWidthPx?: number;
};

/**
 * Drawer lateral + backdrop — só mobile/tablet.
 * Desktop (lg+) não usa este componente; layouts fixos permanecem iguais.
 */
export function MobileNavDrawer({
  open,
  onClose,
  title = "Menu",
  children,
  maxWidthPx = 1023,
}: MobileNavDrawerProps) {
  useBodyScrollLock(open, maxWidthPx);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[60] wag-mobile-drawer" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] wag-mobile-drawer-backdrop"
        aria-label="Fechar menu"
        onClick={onClose}
      />
      <aside
        className="absolute left-0 top-0 bottom-0 w-[min(100%,20.5rem)] bg-white shadow-2xl flex flex-col wag-mobile-drawer-panel wag-safe-x"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 shrink-0">
          <p className="text-sm font-black text-slate-900">{title}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full wag-touch-target"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 wag-mobile-scroll">
          {children}
        </div>
      </aside>
    </div>
  );
}
