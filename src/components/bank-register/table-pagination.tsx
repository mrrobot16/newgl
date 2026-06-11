import type { MouseEvent } from "react";

type TablePaginationProps = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  start: number;
  end: number;
  onPageChange: (page: number) => void;
};

export function TablePagination({ totalItems, currentPage, totalPages, start, end, onPageChange }: TablePaginationProps) {
  const hasPages = totalItems > 0 && totalPages > 0;

  const linkBaseClass = "text-sm transition-colors";
  const enabledClass = "text-gray-700 hover:text-[var(--color-text-highlight)]";
  const disabledClass = "pointer-events-none cursor-not-allowed text-[var(--color-text-disabled)]";

  const linkClass = (enabled: boolean) =>
    `${linkBaseClass} ${enabled ? enabledClass : disabledClass}`;
  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>, page?: number) => {
    event.preventDefault();
    if (!hasPages || !page || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className="m-0 mb-5 flex justify-end px-[5px] py-0">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <span>Go to:</span>
        <a href="#" aria-disabled={!hasPages} className={linkClass(hasPages)} onClick={(event) => handleLinkClick(event)}>
          {currentPage}
        </a>
        <span>of {totalPages}</span>
        <a
          href="#"
          aria-disabled={!hasPages || currentPage <= 1}
          className={linkClass(hasPages && currentPage > 1)}
          onClick={(event) => handleLinkClick(event, currentPage - 1)}
        >
          {"<"}
        </a>
        <a
          href="#"
          aria-disabled={!hasPages || currentPage <= 1}
          className={linkClass(hasPages && currentPage > 1)}
          onClick={(event) => handleLinkClick(event, 1)}
        >
          First
        </a>
        <a
          href="#"
          aria-disabled={!hasPages || currentPage <= 1}
          className={linkClass(hasPages && currentPage > 1)}
          onClick={(event) => handleLinkClick(event, currentPage - 1)}
        >
          Previous
        </a>
        <span>
          {start}-{end} of {totalItems}
        </span>
        <a
          href="#"
          aria-disabled={!hasPages || currentPage >= totalPages}
          className={linkClass(hasPages && currentPage < totalPages)}
          onClick={(event) => handleLinkClick(event, currentPage + 1)}
        >
          Next
        </a>
        <a
          href="#"
          aria-disabled={!hasPages || currentPage >= totalPages}
          className={linkClass(hasPages && currentPage < totalPages)}
          onClick={(event) => handleLinkClick(event, totalPages)}
        >
          Last
        </a>
        <a
          href="#"
          aria-disabled={!hasPages || currentPage >= totalPages}
          className={linkClass(hasPages && currentPage < totalPages)}
          onClick={(event) => handleLinkClick(event, currentPage + 1)}
        >
          {">"}
        </a>
      </div>
    </div>
  );
}
