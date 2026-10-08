// Page title block. `children` renders inside the toolbar row below the
// title/description pair, so filters never crowd the heading.
function PageHeader({ title, description, children }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {description && (
        <p className="page-header__description">{description}</p>
      )}
      {children}
    </div>
  );
}

export { PageHeader };
