import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { Icon } from "./Icon";

// The header search is a real control, not a decorative one. It is a form
// that navigates to the one page in this app whose records are people the
// operator looks up by name, and hands the term to that page's own search
// box.
const SEARCH_TARGET_PATH = "/patients";
const SEARCH_PARAM = "q";

/* -----------------------------------------------------------------------
   PLACEHOLDER ICONS — NOT FUNCTIONAL. Do not read these as working controls.

   The owner's Cure.Med reference shows a theme toggle and a notification bell
   here, and this pass reproduces their position and shape. Neither behaviour
   exists in this app, so both buttons are deliberately inert:

     - No onClick handler at all, so there is no state to corrupt, no effect
       to fire and nothing to log. Clicking one is a no-op, not an error.
     - aria-disabled="true" (not the `disabled` attribute) so the button
       stays reachable by keyboard and keeps a visible focus ring, which a
       disabled button would lose.
     - A title that says plainly that the feature is not available yet, so a
       mouse user is not left guessing.

   WHERE TO HOOK UP REAL BEHAVIOUR:
     theme         Settings already stores the preference — see
                   DEFAULT_SETTINGS.appearance.theme in
                   src/services/settingsStorage.js and the "Appearance" field
                   on src/pages/Settings.jsx. A working toggle means reading
                   that value through useSettings(), applying a theme class or
                   data-theme attribute on <html>, and keeping --color-* tokens
                   in src/styles/tokens.css dark-legible. There is no dark
                   palette in the token file today, so the toggle cannot be
                   switched on without building one.
     notifications Settings already stores the user's preferences —
                   settings.notifications.email / .system in the same file.
                   There is no inbox, no unread count and no delivery layer to
                   read, so the bell's real work is a separate feature.
   ----------------------------------------------------------------------- */
const HEADER_PLACEHOLDERS = [
  {
    key: "theme",
    icon: "fa-moon",
    label: "Toggle dark theme",
    unavailable: "Theme switching is not available yet",
  },
  {
    key: "notifications",
    icon: "fa-bell",
    label: "Notifications",
    unavailable: "Notifications are not available yet",
  },
];

const DATE_FORMAT = {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
};

function today() {
  const now = new Date();

  return {
    // YYYY-MM-DD, for the machine-readable datetime attribute.
    iso: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    label: now.toLocaleDateString(undefined, DATE_FORMAT),
  };
}

// Functional header: identity, a working search, today's date, and the mobile
// navigation control. The title is deliberately small and de-emphasised — the
// page owns the H1.
function Header({ isMenuOpen = false, onToggleMenu }) {
  const navigate = useNavigate();
  const searchId = useId();
  const [term, setTerm] = useState("");
  const { iso, label } = today();
  // aria-expanded must be a real boolean, never undefined.
  const isExpanded = isMenuOpen === true;

  function handleSearchSubmit(event) {
    event.preventDefault();

    const query = term.trim();

    if (!query) {
      return;
    }

    navigate(`${SEARCH_TARGET_PATH}?${SEARCH_PARAM}=${encodeURIComponent(query)}`);
  }

  return (
    <header className="header">
      <button
        type="button"
        className="header-menu-button"
        aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isExpanded}
        aria-controls="app-sidebar"
        onClick={onToggleMenu}
      >
        <Icon name={isMenuOpen ? "close" : "menu"} />
      </button>
      {/* The app's name is identity, not the page title. It is NOT an h1:
          every page owns exactly one h1 (PageHeader, or the Dashboard Hero),
          and a second h1 here made every page carry two. */}
      <p className="header__title">Admin Dashboard</p>

      <form
        className="header-search"
        role="search"
        aria-label="Search patients"
        onSubmit={handleSearchSubmit}
      >
        <label className="sr-only" htmlFor={searchId}>
          Search patients by name, email or phone
        </label>
        <span className="header-search__icon" aria-hidden="true">
          <Icon name="search" />
        </span>
        <input
          id={searchId}
          className="header-search__input"
          type="search"
          name={SEARCH_PARAM}
          autoComplete="off"
          placeholder="Search patients"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </form>

      <p className="header-date">
        <time dateTime={iso}>{label}</time>
      </p>

      {/* Inert placeholders — see HEADER_PLACEHOLDERS above. Rendered from
          data so the two of them cannot drift apart in markup, and given
          data-shell-placeholder so the real wiring is findable later. */}
      {HEADER_PLACEHOLDERS.map(({ key, icon, label, unavailable }) => (
        <button
          key={key}
          type="button"
          className="header-icon-button"
          data-shell-placeholder={key}
          aria-label={label}
          aria-disabled="true"
          title={unavailable}
        >
          <span className="header-icon-button__icon" aria-hidden="true">
            <i className={`fa-solid ${icon}`} />
          </span>
        </button>
      ))}
    </header>
  );
}

export { Header, SEARCH_TARGET_PATH, SEARCH_PARAM };
