import { useCallback, useSyncExternalStore } from "react";
import GradientWaves from "./GradientWaves";

const DEFAULT_COLOR_MAP = {
  waveColor: "#a5a0f5",
  crestColor: "#ffffff",
  horizonColor: "#7b6cff",
};

function getReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeReducedMotion(callback) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = (event) => callback(event.matches);
  if (mql.addEventListener) {
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }
  mql.addListener(handler);
  return () => mql.removeListener(handler);
}

function getTokenColor(varName, fallback) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }
  try {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (val) return val;
  } catch {
    // ignore
  }
  return fallback;
}

const SiteBackground = () => {
  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );

  const renderStatic = useCallback(() => (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: "var(--z-background, -1)",
        background: "var(--gradient-hero)",
      }}
    />
  ), []);

  if (prefersReduced) {
    return renderStatic();
  }

  let colorStops;
  try {
    const waveColor = getTokenColor("--color-accent-subtle", DEFAULT_COLOR_MAP.waveColor);
    const crestColor = getTokenColor("--color-surface", DEFAULT_COLOR_MAP.crestColor);
    const horizonColor = getTokenColor("--color-accent-active", DEFAULT_COLOR_MAP.horizonColor);
    colorStops = [waveColor, crestColor, horizonColor];
  } catch {
    colorStops = [
      DEFAULT_COLOR_MAP.waveColor,
      DEFAULT_COLOR_MAP.crestColor,
      DEFAULT_COLOR_MAP.horizonColor,
    ];
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: "var(--z-background, -1)",
      }}
    >
      <GradientWaves
        colorStops={colorStops}
        baseSpeed={0.008}
        speed={0.15}
        amplitude={1.2}
        swell={12}
        turbulence={7}
        opacity={0.28}
        brightness={1.0}
        detail="low"
        grain={false}
        mouseInteraction={false}
      />
    </div>
  );
};

export default SiteBackground;
