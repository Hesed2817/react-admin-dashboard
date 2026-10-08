import { useId } from "react";
import { Button } from "./Button";
import { PAGE_SIZES } from "../hooks/usePagination";

// Pagination controls for a list that is already fully in memory.
function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemNoun = "records",
}) {
  const pageSizeId = useId();

  if (totalItems === 0) {
    return null;
  }

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="pagination__status" role="status">
        Showing {from}–{to} of {totalItems} {itemNoun}
      </p>

      <div className="pagination__controls">
        {onPageSizeChange && (
          <>
            <label className="sr-only" htmlFor={pageSizeId}>
              {itemNoun} per page
            </label>
            <select
              id={pageSizeId}
              className="field-control pagination__page-size"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </>
        )}

        <Button
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span className="pagination__status">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

export { Pagination };
