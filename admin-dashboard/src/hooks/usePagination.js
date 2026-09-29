import { useState } from "react";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZES = [10, 25, 50];

// Pagination for a list that is already fully in memory. It does not fetch or
// store anything; it only controls which slice is rendered.
function usePagination(items, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp when the item count shrinks (a filter narrowed, a row deleted), so a
  // delete on the last page cannot leave the view pointing past the end.
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = items.slice(startIndex, startIndex + pageSize);

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  function changePageSize(nextSize) {
    setPageSize(nextSize);
    setPage(1);
  }

  return {
    visibleItems,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    setPage: goToPage,
    setPageSize: changePageSize,
  };
}

export { usePagination, DEFAULT_PAGE_SIZE, PAGE_SIZES };
