import { Icon } from "./Icon";

// Functional header: identity plus the mobile navigation control.
// The title is deliberately small and de-emphasised — the page owns the H1.
function Header({ isMenuOpen = false, onToggleMenu }) {
  return (
    <header className="header">
      <button
        type="button"
        className="header-menu-button"
        aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isMenuOpen}
        aria-controls="app-sidebar"
        onClick={onToggleMenu}
      >
        <Icon name={isMenuOpen ? "close" : "menu"} />
      </button>
      <h1>Admin Dashboard</h1>
    </header>
  );
}

export { Header };
