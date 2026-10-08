import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetWidth > 0 || element.offsetHeight > 0,
  );
}

// focusTarget controls where focus lands when the trap engages:
//   "first"     the first focusable child (the drawer: send focus to a link)
//   "container" the trapped element itself (a dialog: announce the title first)
function useFocusTrap(containerRef, isActive, onEscape, focusTarget = "first") {
  const escapeHandlerRef = useRef(onEscape);

  // Held in a ref so the trap effect does not re-run (and steal focus) on
  // every render just because a callback identity changed.
  useEffect(() => {
    escapeHandlerRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;

    if (focusTarget === "container") {
      container.focus();
    } else {
      const initialFocus = getFocusableElements(container)[0];

      if (initialFocus) {
        initialFocus.focus();
      } else if (typeof container.focus === "function") {
        container.focus();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();

        if (escapeHandlerRef.current) {
          escapeHandlerRef.current();
        }

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(container);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === "function" &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, [isActive, containerRef, focusTarget]);
}

export { useFocusTrap, FOCUSABLE_SELECTOR, getFocusableElements };
