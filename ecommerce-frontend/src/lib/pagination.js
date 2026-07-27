// Builds a compact page-number list with "..." gaps, e.g. [1, "...", 4, 5, 6, "...", 339]
export function getPageNumbers(currentPage, totalPages, delta = 1) {
  if (totalPages <= 1) return [1];

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    }
  }

  const withGaps = [];
  let last = null;
  for (const p of pages) {
    if (last !== null) {
      if (p - last === 2) withGaps.push(last + 1);
      else if (p - last > 2) withGaps.push("...");
    }
    withGaps.push(p);
    last = p;
  }

  return withGaps;
}
