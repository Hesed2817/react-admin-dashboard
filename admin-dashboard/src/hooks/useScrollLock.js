import { useEffect } from "react";

// Freezes background scrolling while an overlay is open. Without this the page
// behind a dialog or the mobile drawer can still be scrolled on touch devices.
function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Compensate for the scrollbar so the page does not shift as it locks.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isLocked]);
}

export { useScrollLock };
