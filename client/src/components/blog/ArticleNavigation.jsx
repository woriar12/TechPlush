import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ArticleNavigation = ({ previousBlog, nextBlog }) => {
  if (!previousBlog && !nextBlog) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 border-t border-b border-[#E5E5E5] my-8">
      {/* Previous Article */}
      {previousBlog ? (
        <Link
          to={`/blog/${previousBlog.slug}`}
          className="p-4 border border-[#E5E5E5] rounded-md hover:border-[#171717]/50 bg-white transition-all text-left flex flex-col justify-between group"
        >
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#888888] group-hover:text-[#171717] mb-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous Story
          </span>
          <span className="font-heading text-sm font-bold text-[#171717] group-hover:text-[#333333] line-clamp-1 transition-colors">
            {previousBlog.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Article */}
      {nextBlog ? (
        <Link
          to={`/blog/${nextBlog.slug}`}
          className="p-4 border border-[#E5E5E5] rounded-md hover:border-[#171717]/50 bg-white transition-all text-right flex flex-col justify-between items-end sm:ml-auto w-full group"
        >
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#888888] group-hover:text-[#171717] mb-1.5 transition-colors">
            Next Story
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <span className="font-heading text-sm font-bold text-[#171717] group-hover:text-[#333333] line-clamp-1 transition-colors">
            {nextBlog.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
};

export default ArticleNavigation;
