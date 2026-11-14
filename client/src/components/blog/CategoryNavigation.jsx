import React from "react";
import { Link, useLocation } from "react-router-dom";

const CategoryNavigation = ({ categories = [], activeSlug = null }) => {
  const location = useLocation();
  const isAllActive = (location.pathname === "/blogs" || location.pathname === "/") && !activeSlug;

  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap items-center gap-2 my-4">
      <Link
        to="/blogs"
        className={`whitespace-nowrap border px-3 py-1.5 text-xs font-semibold transition-colors ${
          isAllActive
            ? "bg-[#171717] text-white border-[#171717]"
            : "bg-white text-[#666666] border-[#E5E5E5] hover:text-[#171717] hover:border-[#171717] hover:bg-[#F5F5F5]"
        }`}
      >
        All Articles
      </Link>

      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        return (
          <Link
            key={cat._id}
            to={`/category/${cat.slug}`}
            className={`whitespace-nowrap border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-[#171717] text-white border-[#171717]"
                : "bg-white text-[#666666] border-[#E5E5E5] hover:text-[#171717] hover:border-[#171717] hover:bg-[#F5F5F5]"
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryNavigation;
