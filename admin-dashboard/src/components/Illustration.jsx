// A real illustration in a media slot — the filled-in counterpart to
// MediaPlaceholder, which stays for the slots that still have no asset.
//
// It is an <img> pointing at a bundled SVG rather than an inline <svg>, so the
// artwork is fetched and cached as a file and never inflates the JS bundle.
//
// Two things it does that a bare <img> would not:
//
//  1. It always carries alt text. A missing `alt` silently drops the
//     description and a wrong one is read out loud, so the prop is required in
//     spirit: pass a real sentence, or `alt=""` to mark the image decorative.
//  2. It always carries intrinsic width/height. Without them the browser
//     cannot reserve the box before the file arrives, and the slot jumps.
//
// `src` is an app-local path in `public/`, so it must be absolute: Vite does
// not rewrite a string prop.
function Illustration({
  src,
  alt,
  width,
  height,
  className = "",
}) {
  if (!src || alt === undefined) {
    return null;
  }

  return (
    <img
      className={`illustration ${className}`.trim()}
      src={src}
      alt={alt}
      width={width || undefined}
      height={height || undefined}
      decoding="async"
    />
  );
}

export { Illustration };