import { useEffect, useRef, useState, type ReactNode } from "react";

/** Monta filhos só quando entram na viewport — reduz trabalho no carregamento inicial. */
export function LazyMount({
  children,
  rootMargin = "200px 0px",
  minHeight = 240,
  onVisible,
}: {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: number;
  onVisible?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || show) return;

    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      onVisible?.();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          onVisible?.();
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin, show, onVisible]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
