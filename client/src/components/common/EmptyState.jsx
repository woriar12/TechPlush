import React from "react";
import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyState = ({
  icon: Icon = FileQuestion,
  title = "No articles found",
  description = "No content is available matching your search or filters.",
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-md p-8 text-center max-w-md mx-auto my-8">
      <div className="w-10 h-10 rounded bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-base font-bold text-[#171717] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#666666] mb-6 leading-relaxed">{description}</p>

      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-block px-5 py-2.5 bg-[#171717] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#333333] transition-colors shadow-xs"
        >
          {actionLabel}
        </Link>
      )}

      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 bg-[#171717] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#333333] transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
