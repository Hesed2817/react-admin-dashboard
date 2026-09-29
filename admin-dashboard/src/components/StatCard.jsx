// Compact metric card. The number is the only display-face text in the
// component; the label and description stay in the body font so display type
// stays scarce.
function StatCard({ title, value, description }) {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{title}</p>
      <p className="stat-card__value">{value}</p>
      {description && <p className="stat-card__description">{description}</p>}
    </div>
  );
}

export { StatCard };
