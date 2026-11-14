import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Loading...", minHeight = "min-h-[250px]" }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} p-6 w-full text-[#666666]`}>
      <Loader2 className="w-7 h-7 text-[#171717] animate-spin mb-3" />
      <p className="text-xs sm:text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
