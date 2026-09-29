import { MediaPlaceholder } from "./MediaPlaceholder";

// The one large number on the dashboard.
//
// This is deliberately NOT a StatCard with a bigger font. StatCard is the
// compact repeated tile; this is a single highlight, so it gets the display
// face at full metric size and a media slot, and it is the only place in the
// app where that treatment appears.
function StatHighlight({ label, value, description, mediaLabel }) {
  return (
    <section className="stat-highlight card">
      <div className="stat-highlight__text">
        <p className="stat-card__label">{label}</p>
        <p className="metric stat-highlight__value">{value}</p>
        {description && (
          <p className="stat-highlight__description">{description}</p>
        )}
      </div>
      <MediaPlaceholder
        className="stat-highlight__media"
        label={mediaLabel || `${label} illustration placeholder`}
      />
    </section>
  );
}

export { StatHighlight };
