import { useId } from "react";

// A labelled form control. Every input, select and textarea in the app goes
// through this so that:
//   - the label is a real <label> bound to the control, never a placeholder
//   - an error is linked with aria-describedby and announced via role="alert"
//   - aria-invalid is set when the field has an error
// `children` is the control element; it receives the generated id.
function Field({ label, error, hint, children, className = "" }) {
  const controlId = useId();
  const errorId = `${controlId}-error`;
  const hintId = `${controlId}-hint`;
  const classes = ["field", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <label className="field-label" htmlFor={controlId}>
        {label}
      </label>
      {children({
        id: controlId,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": [error ? errorId : null, hint ? hintId : null]
          .filter(Boolean)
          .join(" ") || undefined,
      })}
      {hint && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { Field };
