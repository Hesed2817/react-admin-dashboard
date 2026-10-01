import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

// A row's actions, collapsed behind one button on narrow viewports.
//
// Why role="menu" and not four buttons: it makes the whole group ONE tab stop
// instead of four, which is the actual problem at 390px, and it gives the
// arrow keys somewhere to go once focus is inside.
//
// Why it is deliberately not a Modal: focus is not trapped and Tab closes the
// menu and walks on. A row menu is a non-modal popover, and trapping focus in
// one would strand a keyboard user in a ten-row table.
//
// Every entry calls the caller's handler unchanged. The caller builds the
// descriptor list once and renders it here or as buttons, so the two views
// cannot drift apart.
//
//   items: [{ key, label, icon, onSelect, danger }]
function RowActionsMenu({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);
  const initialIndexRef = useRef(0);
  const menuId = useId();

  const close = useCallback(({ restoreFocus = false } = {}) => {
    setIsOpen(false);

    // Restoring is explicit, not something done on unmount: deleting a row
    // unmounts the trigger, and focusing a detached node does nothing.
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // A mousedown anywhere outside closes, giving the same "click away" as the
  // modal backdrop without the backdrop. mousedown fires before blur, so a
  // click on an item never closes the menu out from under itself.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onMouseDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        close();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, close]);

  // Nothing else moves focus into the list, so opening has to. ArrowDown on
  // the trigger opens on the first item and ArrowUp on the last.
  useEffect(() => {
    if (isOpen) itemRefs.current[initialIndexRef.current]?.focus();
  }, [isOpen]);

  const open = (index = 0) => {
    initialIndexRef.current = index;
    setIsOpen(true);
  };

  const focusItem = (index) => {
    // Wraps, so ArrowDown at the end returns to the top.
    const count = items.length;
    itemRefs.current[(index + count) % count]?.focus();
  };

  const onTriggerKeyDown = (event) => {
    // Enter and Space already activate a <button>; only the arrows need help.
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      open(items.length - 1);
    }
  };

  const onItemKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItem(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItem(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItem(0);
        break;
      case "End":
        event.preventDefault();
        focusItem(items.length - 1);
        break;
      case "Escape":
        // stopPropagation: the shell also closes things on Escape, and closing
        // this row's menu should not also tear down the drawer behind it.
        event.preventDefault();
        event.stopPropagation();
        close({ restoreFocus: true });
        break;
      case "Tab":
        // No trap. Focus is handed back to the trigger first so the browser's
        // own Tab then advances from there to the next row's trigger, which is
        // the point of collapsing four buttons into one. Closing without it
        // would unmount the focused item mid-keypress and drop focus to <body>.
        close({ restoreFocus: true });
        break;
      default:
        break;
    }
  };

  return (
    <div className="row-actions-menu" ref={rootRef}>
      <Button
        size="sm"
        className="row-actions-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`Actions for ${label}`}
        ref={triggerRef}
        onClick={() => (isOpen ? close({ restoreFocus: true }) : open())}
        onKeyDown={onTriggerKeyDown}
      >
        <Icon name="more" />
      </Button>

      {isOpen && (
        <ul className="row-actions-menu__list" id={menuId} role="menu" aria-label={`Actions for ${label}`}>
          {items.map((item, index) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                // Roving focus: items are reached with the arrows, not Tab,
                // which is what keeps the group to a single tab stop.
                tabIndex={-1}
                className={`row-actions-menu__item${item.danger ? " row-actions-menu__item--danger" : ""}`}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                onClick={() => {
                  close({ restoreFocus: true });
                  item.onSelect();
                }}
                onKeyDown={(event) => onItemKeyDown(event, index)}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { RowActionsMenu };