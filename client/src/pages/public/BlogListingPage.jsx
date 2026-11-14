import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPublishedBlogs } from "../../services/blogService";
import { getCategories } from "../../services/categoryService";
import ArticleCard from "../../components/blog/ArticleCard";
import SearchBar from "../../components/blog/SearchBar";
import CategoryNavigation from "../../components/blog/CategoryNavigation";
import Pagination from "../../components/common/Pagination";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import usePageMetadata from "../../hooks/usePageMetadata";

const BlogListingPage = () => {
  usePageMetadata(
    "Articles",
    "Practical reporting, tutorials and ideas for people who work with technology."
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch((e) => console.error("Failed to load categories:", e));
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 9,
      };
      if (currentSearch) params.search = currentSearch;
      if (currentCategory) params.category = currentCategory;

      const res = await getPublishedBlogs(params);
      if (res.success) {
        setBlogs(res.data?.blogs || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, currentSearch, currentCategory]);

  const handleSearch = (query) => {
    const next = new URLSearchParams(searchParams);
    if (query) {
      next.set("search", query);
    } else {
      next.delete("search");
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handlePageChange = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", page.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="magazine-container min-h-[60vh] py-8 sm:py-10">
      {/* Page Header */}
      <div className="pb-5 border-b border-[#E5E5E5] mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#171717] mb-2 tracking-tight">
          All Blogs
        </h1>
        <p className="text-sm text-[#666666] mb-5 max-w-xl leading-relaxed">
          Practical reporting, tutorials and ideas for people who work with technology.
        </p>

        {/* Search */}
        <div className="max-w-xl mb-4">
          <SearchBar initialQuery={currentSearch} onSearch={handleSearch} className="max-w-xl my-0" />
        </div>

        {/* Category Filter Buttons */}
        <CategoryNavigation categories={categories} activeSlug={currentCategory} />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading blogs..." minHeight="min-h-[350px]" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBlogs} />
      ) : blogs.length === 0 ? (
        <EmptyState
          title="No blogs found"
          description={
            currentSearch
              ? `No blogs match your search "${currentSearch}". Try a different keyword.`
              : "No blogs are available in this category yet."
          }
          actionLabel="View All Blogs"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-[#666666] mb-6">
            <span>
              Showing <span className="font-semibold text-[#171717]">{blogs.length}</span> of{" "}
              <span className="font-semibold text-[#171717]">{pagination.total}</span> blogs
            </span>
            {currentCategory && (
              <span className="font-semibold text-[#171717] bg-[#F5F5F5] border border-[#E5E5E5] px-2.5 py-1 rounded-sm">
                Topic: {currentCategory}
              </span>
            )}
          </div>

          {/* Clean Three-Column Article Card Layout */}
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

export default BlogListingPage;
