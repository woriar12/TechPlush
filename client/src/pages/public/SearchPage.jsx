import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPublishedBlogs } from "../../services/blogService";
import ArticleCard from "../../components/blog/ArticleCard";
import SearchBar from "../../components/blog/SearchBar";
import Pagination from "../../components/common/Pagination";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { Search } from "lucide-react";
import usePageMetadata from "../../hooks/usePageMetadata";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  usePageMetadata(
    query ? `Search: ${query}` : "Search articles",
    query ? `Search TechPulse articles for ${query}.` : "Search across TechPulse article titles, excerpts, and keywords."
  );

  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    if (!query.trim()) {
      setBlogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getPublishedBlogs({ search: query, page, limit: 9 });
      if (res.success) {
        setBlogs(res.data?.blogs || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to search articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [query, page]);

  const handleSearchSubmit = (newQuery) => {
    setSearchParams({ q: newQuery, page: "1" });
  };

  const handlePageChange = (p) => {
    setSearchParams({ q: query, page: p.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="magazine-container min-h-[60vh] py-8 sm:py-10">
      <div className="mx-auto mb-8 max-w-2xl border-b border-[#E5E5E5] pb-6">
        <p className="section-kicker">Explore the archive</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#171717] mb-2 tracking-tight">
          Search Blogs
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mb-5">
          Search across blog titles, excerpts, and keywords.
        </p>

        <SearchBar initialQuery={query} onSearch={handleSearchSubmit} />

        {query && (
          <p className="text-xs text-[#666666] mt-3">
            Showing results for <span className="font-semibold text-[#171717]">"{query}"</span>
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Searching blogs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchResults} />
      ) : !query.trim() ? (
        <EmptyState
          icon={Search}
          title="Type a search query"
          description="Enter a keyword in the box above to find matching blogs."
        />
      ) : blogs.length === 0 ? (
        <EmptyState
          title={`No blogs found for "${query}"`}
          description="Try checking for spelling or search with a broader topic like Node.js, AI, Cloud, or React."
          actionLabel="Clear Search"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <>
          <div className="text-xs text-[#666666] mb-6">
            Found <span className="font-semibold text-[#171717]">{pagination.total}</span> matching {pagination.total === 1 ? "blog" : "blogs"}
          </div>

          {/* Clean 3-Column Grid */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <ArticleCard key={blog._id} blog={blog} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default SearchPage;
