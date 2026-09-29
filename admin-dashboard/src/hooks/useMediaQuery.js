import { useMemo, useSyncExternalStore } from "react";

// The shell breakpoint. Kept in one place so CSS and JS cannot drift apart.
const COMPACT_VIEWPORT_QUERY = "(max-width: 767px)";

// A media query is an external store, so it is read through the same
// subscribe/getSnapshot pair useSyncExternalStore expects. That is what makes
// the result live: every "change" event on the query re-renders the component.
// A one-shot read inside useState would go stale the moment the viewport
// changed, which is the bug this replaces; a manual useEffect + setState would
// instead cause a cascading render. The third argument to useSyncExternalStore
// is the server snapshot.
function createMediaQueryStore(query) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return { subscribe: () => () => {}, getSnapshot: () => false };
  }

  return {
    subscribe(onStoreChange) {
      const mediaQueryList = window.matchMedia(query);

      // Safari below 14 only has the deprecated addListener/removeListener.
      if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", onStoreChange);
        return () =>
          mediaQueryList.removeEventListener("change", onStoreChange);
      }

      mediaQueryList.addListener(onStoreChange);
      return () => mediaQueryList.removeListener(onStoreChange);
    },
    getSnapshot() {
      return window.matchMedia(query).matches;
    },
  };
}

function useMediaQuery(query) {
  const store = useMemo(() => createMediaQueryStore(query), [query]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => false,
  );
}

function useIsCompactViewport() {
  return useMediaQuery(COMPACT_VIEWPORT_QUERY);
}

export {
  useMediaQuery,
  useIsCompactViewport,
  createMediaQueryStore,
  COMPACT_VIEWPORT_QUERY,
};
