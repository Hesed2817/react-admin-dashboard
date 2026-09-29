import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { Icon } from "./Icon";

// The header search is a real control, not a decorative one. It is a form
// that navigates to the one page in this app whose records are people the
// operator looks up by name, and hands the term to that page's own search
// box. A bell or a theme toggle is deliberately NOT here: this app has no
// notification inbox and no working theme, and a control that does nothing
// is worse than no control.
const SEARCH_TARGET_PATH = "/patients";
const SEARCH_PARAM = "q";

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
    </header>
  );
}

export { Header, SEARCH_TARGET_PATH, SEARCH_PARAM };
