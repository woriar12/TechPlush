import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav aria-label="Article pagination" className="flex items-center justify-center gap-1.5 py-8 select-none text-xs">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 px-3.5 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] hover:border-[#171717] hover:text-[#171717] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
      >
        <ChevronLeft aria-hidden="true" className="w-3.5 h-3.5" />
        <span>Prev</span>
      </button>

      <div className="flex items-center gap-1">
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
              className={`min-w-[34px] h-[34px] px-2.5 rounded border font-semibold transition-all shadow-xs ${
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
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 px-3.5 py-2 border border-[#E5E5E5] rounded bg-white text-[#171717] hover:border-[#171717] hover:text-[#171717] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
      >
        <span>Next</span>
        <ChevronRight aria-hidden="true" className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
};

export default Pagination;
