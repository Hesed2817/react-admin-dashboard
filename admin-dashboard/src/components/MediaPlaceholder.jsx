// Placeholder media for the slots this redesign wants filled with an
// illustration, photo or avatar that the app does not have real assets for.
//
// It renders a dashed "empty frame" with a simple SVG silhouette in the
// current palette. That is deliberate: an <img> pointing at a missing file
// produces a broken-image glyph and a filename, which reads as a bug rather
// than as an unfilled slot.
//
// Accessibility: the frame carries role="img" and an aria-label, which is
// how an inline SVG announces its alt text. The silhouette inside is
// aria-hidden because the frame's name already covers it. When a label is
// supplied it is also rendered as visible text, so the slot is self-evident
// to sighted users too.
//
// This component is inert. It is not a button, it has no state, and it
// renders nothing but markup — there is no event handler to get wrong.

const GLYPHS = {
  illustration: (
    <>
      <rect x="1.5" y="3.5" width="21" height="17" rx="2.5" />
      <path d="M1.5 15.5l4.5-4.5 3.5 3.5 3-3 7 6.5" />
      <circle cx="8" cy="8.5" r="1.75" />
    </>
  ),
  avatar: (
    <>
      <circle cx="12" cy="12" r="10.5" />
      <circle cx="12" cy="9.5" r="3.5" />
      <path d="M4.8 19.8a8 8 0 0 1 14.4 0" />
    </>
  ),
};

const DEFAULT_LABEL = {
  illustration: "Illustration placeholder",
  avatar: "Avatar placeholder",
};

// `kind`   which silhouette to draw
// `variant` block (default) | avatar (circular) | inline (small chip)
// `label`  overrides the default accessible name, and is shown as caption
//          text wherever the variant has room for it
function MediaPlaceholder({
  kind = "illustration",
  variant = "block",
  label,
  className = "",
}) {
  const glyph = GLYPHS[kind];

  if (!glyph) {
    return null;
  }

  const accessibleName = label || DEFAULT_LABEL[kind];
  const hasCaption = variant !== "avatar" && accessibleName;

  const classes = [
    "media-placeholder",
    variant === "avatar" && "media-placeholder--avatar",
    variant === "inline" && "media-placeholder--inline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="img" aria-label={accessibleName}>
      <span className="media-placeholder__glyph" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          {glyph}
        </svg>
      </span>

      {hasCaption && (
        <p className="media-placeholder__label">{accessibleName}</p>
      )}
    </div>
  );
}

export { MediaPlaceholder };
