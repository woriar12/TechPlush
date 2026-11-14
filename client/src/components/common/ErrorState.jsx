import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

const ErrorState = ({
  title = "Failed to load content",
  message = "An error occurred while communicating with the server.",
  onRetry,
}) => {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-md p-6 sm:p-8 text-center max-w-md mx-auto my-8">
      <div className="w-10 h-10 rounded bg-[#F5F5F5] border border-[#E5E5E5] text-[#171717] flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-base font-bold text-[#171717] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#666666] mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171717] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#333333] transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
