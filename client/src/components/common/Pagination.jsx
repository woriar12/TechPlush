import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages < 1) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const pages = [];
  for (let i = 1; i <= safeTotalPages; i++) {
    if (
      i === 1 ||
      i === safeTotalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav aria-label="Blog pagination" className="flex items-center justify-center gap-2 py-10 select-none text-xs sm:text-sm">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E5E5] rounded bg-white font-medium text-[#171717] hover:border-[#171717] hover:text-[#171717] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
      >
        <ChevronLeft aria-hidden="true" className="w-4 h-4" />
        <span>Previous</span>
      </button>

      <div className="flex items-center gap-1.5">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-[#888888]">
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Go to page ${p}`}
              aria-current={isActive ? "page" : undefined}
              className={`min-w-[36px] h-[36px] px-3 rounded border font-semibold transition-all shadow-xs cursor-pointer ${
                isActive
                  ? "bg-[#171717] text-white border-[#171717]"
                  : "bg-white text-[#171717] border-[#E5E5E5] hover:border-[#171717] hover:bg-[#F5F5F5]"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= safeTotalPages}
        className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E5E5] rounded bg-white font-medium text-[#171717] hover:border-[#171717] hover:text-[#171717] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
      >
        <span>Next</span>
        <ChevronRight aria-hidden="true" className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
