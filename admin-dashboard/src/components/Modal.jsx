import { useId, useRef } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useScrollLock } from "../hooks/useScrollLock";

// An accessible dialog:
//   - role="dialog" + aria-modal, labelled by its own title
//   - focus moves to the dialog on open and returns to the trigger on close
//   - Tab is trapped inside; Escape and a backdrop click both close
//   - background scrolling is locked while open
//
// `title` is required: a dialog with no accessible name cannot be announced.
function Modal({
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = "secondary",
  cancelLabel = "Cancel",
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(dialogRef, true, onClose, "container");
  useScrollLock(true);

  return (
    <div
      className="modal-backdrop"
      // A click that lands on the backdrop itself (not the dialog) closes.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <div className="modal__header">
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="modal__body" id={descriptionId}>
          {children}
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { Modal };
