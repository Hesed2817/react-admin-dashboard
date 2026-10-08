import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { NavLink, useLocation } from "react-router";
import { MediaPlaceholder } from "./MediaPlaceholder";
import { useSettings } from "../hooks/useSettings";

// A layout effect, not a passive one: the active highlight's position has to
// be correct BEFORE the browser paints, or the panel flashes with the block
// sitting in the wrong place. There is no layout and no paint on the server,
// and React warns about useLayoutEffect during renderToString, so the server
// gets the no-op version.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

// Font Awesome Free (solid) class names. Solid only, so the app loads one
// webfont. Each icon is decorative and sits beside a real text label, so it
// is aria-hidden and never carries meaning on its own. The folded rail reuses
// these exact glyphs: there is no second icon set for the collapsed state.
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "fa-gauge-high" },
  { to: "/users", label: "Users", icon: "fa-users" },
  { to: "/patients", label: "Patients", icon: "fa-user-doctor" },
  { to: "/reports", label: "Reports", icon: "fa-chart-column" },
  { to: "/activity", label: "Activity", icon: "fa-clock-rotate-left" },
  { to: "/settings", label: "Settings", icon: "fa-gear" },
];

// Two groups, because there IS a real split here: the five pages you work in
// versus the single page that configures the app. Settings is the only
// secondary item, so it is its own labelled group rather than being padded
// out with invented siblings.
const WORKSPACE_ITEMS = NAV_ITEMS.filter((item) => item.to !== "/settings");
const SECONDARY_ITEMS = NAV_ITEMS.filter((item) => item.to === "/settings");

const NAV_GROUPS = [
  { key: "workspace", label: "Workspace", items: WORKSPACE_ITEMS },
  { key: "secondary", label: "Preferences", items: SECONDARY_ITEMS },
];

const COLLAPSE_ICON = "fa-angles-left";
const EXPAND_ICON = "fa-angles-right";

// The sidebar sits inside SettingsProvider in AdminLayout, so this reads the
// same profile the Settings page edits. Nothing here is invented: the empty
// state is shown as an empty state, not filled in with a placeholder person.
function useProfileCard() {
  const { settings } = useSettings();
  const name = settings.profile.name.trim();
  const role = settings.profile.role.trim();

  return {
    name: name || "Profile not set",
    role: role || "Set your details in Settings",
    isEmpty: !name && !role,
  };
}

const Sidebar = forwardRef(function Sidebar(
  { isOpen = false, isCollapsed = false, onToggleCollapsed, onNavigate },
  ref,
) {
  const profile = useProfileCard();
  const { pathname } = useLocation();

  // The scrollable middle of the panel. It is the measurement origin for the
  // highlight and the element ResizeObserver watches for width changes.
  const navListRef = useRef(null);
  const [indicator, setIndicator] = useState(null);

  const lastNavWidth = useRef(null);

  const measureIndicator = useCallback(() => {
    const navList = navListRef.current;

    if (!navList) {
      return;
    }

    // .nav-link--active is the class this component itself sets from the
    // NavLink render prop, so the highlight follows exactly the same state
    // as the link's own styling. It does not depend on NavLink internals.
    const activeLink = navList.querySelector(".nav-link--active");

    if (!activeLink) {
      setIndicator(null);
      return;
    }

    // offsetTop/offsetHeight are relative to the nearest positioned ancestor,
    // which is .nav-groups (position: relative). The highlight is a child of
    // that same element, so its transform is expressed in the same frame.
    const top = activeLink.offsetTop;
    const height = activeLink.offsetHeight;

    setIndicator((current) =>
      current && current.top === top && current.height === height
        ? current
        : { top, height },
    );
  }, []);

  /* Folding does NOT move the highlight, and that is the whole trick.

     The obvious implementation measures on every fold and either slides the
     bar to its new row or adds a flag to suppress the slide. Both are wrong
     here: the labels disappear the instant the panel narrows, so the rows
     have already jumped while a sliding bar is still catching up — a visible
     misalignment for the length of the transition.

     So the two states are built to have IDENTICAL row geometry: a folded link
     keeps its vertical padding (only the horizontal padding and the label
     change), and a folded group label keeps its box via visibility rather
     than display. Every row therefore sits at the same offset in both states,
     measureIndicator() finds nothing new, and the highlight cannot misalign
     during or after a fold. The re-measure on isCollapsed is kept anyway: it
     is the safety net if a future style breaks that invariant. */
  useIsomorphicLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator, pathname, isCollapsed, isOpen]);

  // Width changes can re-wrap a label and therefore change an item's height
  // and every item below it. This is the 768-1199px step, browser zoom and
  // window resizing. The indicator is out of flow, so observing the nav list
  // cannot feed back into this.
  useEffect(() => {
    const navList = navListRef.current;

    if (!navList || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;

      if (
        typeof width !== "number" ||
        (typeof lastNavWidth.current === "number" &&
          Math.abs(width - lastNavWidth.current) < 0.5)
      ) {
        return;
      }

      lastNavWidth.current = width;
      measureIndicator();
    });

    observer.observe(navList);

    return () => observer.disconnect();
  }, [measureIndicator]);

  // The display face is a webfont. If it lands after first paint it can
  // change an item's line box, so the highlight is re-measured once the
  // fonts are ready.
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts?.ready) {
      return;
    }

    let isCancelled = false;

    document.fonts.ready.then(() => {
      if (!isCancelled) {
        measureIndicator();
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [measureIndicator]);

  function handleNavClick(event) {
    if (event.defaultPrevented) {
      return;
    }

    // When the motion preference is set the highlight must change position
    // immediately, not slide. CSS already forces the transition to 0.01ms,
    // but a transition that short can still paint one frame at the OLD
    // offset; positioning it here, in the same event as the route change,
    // removes that frame entirely.
    if (prefersReducedMotion()) {
      const link = event.currentTarget;

      setIndicator({ top: link.offsetTop, height: link.offsetHeight });
    }

    onNavigate?.();
  }

  const indicatorClasses = ["nav-indicator"];

  return (
    <nav
      ref={ref}
      id="app-sidebar"
      className={[
        "sidebar",
        isOpen && "is-open",
        isCollapsed && "is-collapsed",
      ]
        .filter(Boolean)
        .join(" ")}
      tabIndex={-1}
      aria-label="Main navigation"
    >
      <div className="nav-groups" ref={navListRef}>
        {/* ONE highlight element for the whole panel, moved with a transform
            rather than re-rendered per item. It is decorative: the active
            link carries aria-current and a heavier weight, so the state is
            never carried by this block alone. */}
        {indicator && (
          <span className={indicatorClasses} aria-hidden="true">
            <span
              className="nav-indicator__bar"
              style={{
                height: `${indicator.height}px`,
                transform: `translateY(${indicator.top}px)`,
              }}
            />
          </span>
        )}

        {NAV_GROUPS.map((group) => (
          <div className="nav-group" key={group.key}>
            <p className="nav-group__label">{group.label}</p>
            <ul>
              {group.items.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link nav-link--active" : "nav-link"
                    }
                    to={to}
                    end={to === "/"}
                    onClick={handleNavClick}
                    // Always named explicitly. The visible label is removed
                    // from the box in the folded rail, and a link with no
                    // text and no name is an unlabelled control; the string
                    // is identical to the visible one when expanded, so this
                    // satisfies "label in name" and changes nothing then.
                    aria-label={label}
                    // Native tooltip for pointer users, only while folded,
                    // because that is the only state with no visible text.
                    // AT and keyboard users get the aria-label instead.
                    title={isCollapsed ? label : undefined}
                  >
                    <span className="nav-link__icon" aria-hidden="true">
                      <i className={`fa-solid ${icon}`} />
                    </span>
                    <span className="nav-link__label">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pinned to the bottom of the panel in both states. The nav list above
          is the only scrollable region, so this is never pushed out of view
          by a long list or a short window. */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-controls="app-sidebar"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="nav-link__icon" aria-hidden="true">
            <i
              className={`fa-solid ${
                isCollapsed ? EXPAND_ICON : COLLAPSE_ICON
              }`}
            />
          </span>
          <span className="nav-link__label sidebar-toggle__label">
            Collapse sidebar
          </span>
        </button>

        {/* Real profile data from Settings, and a real destination: the card
            navigates to the page that edits exactly this information. It is
            not a decorative avatar with a dead click target. Folded, it keeps
            the avatar and drops the two text lines, so it needs its own name
            because that text is gone. */}
        <NavLink
          className="sidebar-profile"
          to="/settings"
          onClick={handleNavClick}
          aria-label={isCollapsed ? "Profile and settings" : undefined}
        >
          <MediaPlaceholder
            kind="avatar"
            variant="avatar"
            label="Profile photo placeholder"
          />
          <span className="sidebar-profile__text">
            <span className="sidebar-profile__name">{profile.name}</span>
            <span className="sidebar-profile__role">{profile.role}</span>
          </span>
        </NavLink>
      </div>
    </nav>
  );
});

export { Sidebar };
