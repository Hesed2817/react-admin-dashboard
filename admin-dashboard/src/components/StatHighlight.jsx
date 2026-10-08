
// The one large number on the dashboard.
//
// This is deliberately NOT a StatCard with a bigger font. StatCard is the
// compact repeated tile; this is a single highlight, so it gets the display
// face at full metric size and a media slot, and it is the only place in the
// app where that treatment appears.
//
// Decorative blobs are rendered in the background via CSS; the inline SVG is
// allowed but not necessary — the presentational image below is inert and
// hidden from assistive tech.
function StatHighlight({ label, value, description }) {
  return (
    <section className="stat-highlight card">
      <img
        className="stat-highlight__blobs"
        src="/decor/blobs-total-patients.svg"
        alt=""
        aria-hidden="true"
      />
      <div className="stat-highlight__text">
        <p className="stat-card__label">{label}</p>
        <p className="metric stat-highlight__value">{value}</p>
        {description && (
          <p
            className="stat-highlight__description"
            dangerouslySetInnerHTML={{
              __html: description.replace(/(\d+)/g, '<strong>$1</strong>'),
            }}
          />
        )}
      </div>
      <img
        className="stat-highlight__media stat-highlight__illustration"
        src="/illustrations/clipb.png"
        alt="Clipboard illustration"
        aria-hidden="true"
      />
    </section>
  );
}

export { StatHighlight };
