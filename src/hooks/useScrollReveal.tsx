import { useEffect, useRef } from "react";

/**
 * Observes all direct <section> children of a container
 * and fades them in as they enter the viewport.
 */
export function useScrollRevealContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll<HTMLElement>(":scope > section");

    sections.forEach((section, i) => {
      if (i === 0) return;
      section.style.opacity = "0";
      section.style.transform = "translateY(40px)";
      section.style.transition =
        "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((section, i) => {
      if (i === 0) return;
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
