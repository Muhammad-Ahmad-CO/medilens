"use client";
/**
 * Scroll-reveal wrapper: fades/slides children in when they enter the viewport.
 * Zero dependencies — pure IntersectionObserver.
 */
import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({
  children,
  delay = "",
  className = "",
}: {
  children: ReactNode;
  delay?: "" | "reveal-d1" | "reveal-d2";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${delay} ${className}`}>
      {children}
    </div>
  );
}
