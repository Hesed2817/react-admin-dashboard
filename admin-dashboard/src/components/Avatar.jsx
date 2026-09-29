// Initials from a record's name. Functional: it identifies which record the
// detail panel is showing. Falls back to a neutral glyph-free block.
function Avatar({ name }) {
  const initials = (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="avatar" aria-hidden="true">
      {initials || "—"}
    </span>
  );
}

export { Avatar };
