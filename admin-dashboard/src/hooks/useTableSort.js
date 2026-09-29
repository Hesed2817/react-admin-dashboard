import { useMemo, useState } from "react";

const ASCENDING = "ascending";
const DESCENDING = "descending";

// Generic client-side sort for a table that already holds all its rows.
// Stable, cycle-free (asc -> desc), and tolerant of missing values: null,
// undefined and "" always sort last regardless of direction, so a blank
// cell never masquerades as a real value.
function useTableSort(rows, columns, initialKey = null) {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDirection, setSortDirection] = useState(ASCENDING);

  const column = columns.find((c) => c.key === sortKey) || null;

  const sortedRows = useMemo(() => {
    if (!column) {
      return rows;
    }

    const accessor = column.sortValue || ((row) => row[column.key]);
    const sign = sortDirection === ASCENDING ? 1 : -1;

    return rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const left = accessor(a.row);
        const right = accessor(b.row);

        const leftEmpty = left === null || left === undefined || left === "";
        const rightEmpty = right === null || right === undefined || right === "";

        if (leftEmpty && rightEmpty) return a.index - b.index;
        if (leftEmpty) return 1;
        if (rightEmpty) return -1;

        let comparison;

        if (typeof left === "number" && typeof right === "number") {
          comparison = left - right;
        } else {
          comparison = String(left).localeCompare(String(right), undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }

        // Fall back to original order on ties so the list never jitters.
        return comparison === 0 ? a.index - b.index : comparison * sign;
      })
      .map(({ row }) => row);
  }, [rows, column, sortDirection]);

  function toggleSort(key) {
    if (key !== sortKey) {
      setSortKey(key);
      setSortDirection(ASCENDING);
      return;
    }

    setSortDirection((current) =>
      current === ASCENDING ? DESCENDING : ASCENDING,
    );
  }

  return {
    sortedRows,
    sortKey,
    sortDirection,
    toggleSort,
    getAriaSort: (key) => (key === sortKey ? sortDirection : "none"),
  };
}

export { useTableSort, ASCENDING, DESCENDING };
