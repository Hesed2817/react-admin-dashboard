// Toolbar row: filters, search and the page's primary action.
// Marked as a search/filter region so it is reachable as a landmark.
function PageActions({ children, label = "Page controls" }) {
  return (
    <div className="page-actions" role="search" aria-label={label}>
      {children}
    </div>
  );
}

export { PageActions };
