import { Icon } from "./Icon";

// Minimal monochrome empty state. The icon is a subordinate status glyph, not
// an accent: it stays muted and is aria-hidden, so the title carries the
// meaning. Only the primary action inside it is accent-coloured.
function EmptyState({ title, message, icon = "inbox", children }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name={icon} />
      </span>
      <p className="empty-state__title">{title}</p>
      {message && <p className="empty-state__message">{message}</p>}
      {children}
    </div>
  );
}

export { EmptyState };
