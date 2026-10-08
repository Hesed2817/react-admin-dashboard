// A group of mutually exclusive options rendered as rounded pills.
//
// Deliberately buttons in a labelled group rather than a <select>: the
// reference uses pills, and a set of options that are always all visible does
// not need a dropdown to reveal them. `aria-pressed` is what carries the
// current selection to assistive tech, so the active pill is never signalled
// by colour alone — the ring is a second, visible cue.
function FilterPills({ label, options, value, onChange, className = "" }) {
  const classes = ["pill-group", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="group" aria-label={label}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={isSelected ? "pill pill--active" : "pill"}
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { FilterPills };
