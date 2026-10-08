import { Icon } from "./Icon";

// Horizontal scroll container for wide tables. `tabIndex` + role="region" with
// a label means keyboard users can actually reach and scroll the overflow,
// which they otherwise cannot.
function TableScroll({ label, children }) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

// A sortable column header. The button carries the accessible name; the
// <th> carries aria-sort so assistive tech announces the current order.
function SortableTh({ columnKey, label, getAriaSort, onToggle, className = "" }) {
  const ariaSort = getAriaSort(columnKey);
  const isActive = ariaSort !== "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={className}
    >
      <button
        type="button"
        className="th-sort"
        onClick={() => onToggle(columnKey)}
      >
        {label}
        <Icon name="sort" />
        <span className="sr-only">
          {isActive
            ? `, sorted ${ariaSort === "ascending" ? "descending" : "ascending"}`
            : ", not sorted"}
        </span>
      </button>
    </th>
  );
}

function Th({ label, className = "", children }) {
  return (
    <th scope="col" className={className}>
      {children || label}
    </th>
  );
}

export { TableScroll, SortableTh, Th };
