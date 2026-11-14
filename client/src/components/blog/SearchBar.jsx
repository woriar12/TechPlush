import React, { useId, useState } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  initialQuery = "",
  onSearch,
  placeholder = "Search articles by title, excerpt, or keyword...",
  className = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputId = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className || "max-w-xl my-3"}`}>
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <label htmlFor={inputId} className="sr-only">Search articles</label>
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-[#D9D9D9] bg-white py-2.5 pl-9 pr-8 text-sm text-[#171717] placeholder-[#716B65] transition-colors focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
          />
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#888888] hover:text-[#171717] absolute right-2.5 top-1/2 -translate-y-1/2"
              aria-label="Clear query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333333]"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
