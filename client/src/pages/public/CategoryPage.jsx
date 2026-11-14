import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublishedBlogs } from "../../services/blogService";
import { getCategories } from "../../services/categoryService";
import ArticleCard from "../../components/blog/ArticleCard";
import CategoryNavigation from "../../components/blog/CategoryNavigation";
import Pagination from "../../components/common/Pagination";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { ArrowLeft } from "lucide-react";
import usePageMetadata from "../../hooks/usePageMetadata";

const CategoryPage = () => {
  const { slug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  usePageMetadata(
    `${category?.name || slug.replace(/-/g, " ")} articles`,
    category?.description || `Read the latest TechPulse articles about ${category?.name || slug.replace(/-/g, " ")}.`
  );

  useEffect(() => {
    setPage(1);
  }, [slug]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [blogsRes, categoriesRes] = await Promise.all([
        getPublishedBlogs({ category: slug, page, limit: 9 }),
        getCategories(),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
        const found = (categoriesRes.data || []).find((c) => c.slug === slug);
        setCategory(found || null);
      }

      if (blogsRes.success) {
        setBlogs(blogsRes.data?.blogs || []);
        if (blogsRes.data?.pagination) {
          setPagination(blogsRes.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load category articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug, page]);

  return (
    <div className="magazine-container min-h-[60vh] py-8 sm:py-10">
      {/* Category Header */}
      <div className="pb-5 border-b border-[#E5E5E5] mb-8">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666666] hover:text-[#171717] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Articles</span>
        </Link>

        <div className="mb-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#171717] mb-2 capitalize tracking-tight">
            {category?.name || slug.replace(/-/g, " ")}
          </h1>
        </div>

        {category?.description && (
          <p className="text-sm sm:text-base text-[#666666] max-w-2xl leading-relaxed mb-4">
            {category.description}
          </p>
        )}

        {/* Categories Bar */}
        <CategoryNavigation categories={categories} activeSlug={slug} />
      </div>

      {/* Main Grid: Clean 3-Column Layout */}
      {loading ? (
        <LoadingSpinner message="Loading articles..." minHeight="min-h-[350px]" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : blogs.length === 0 ? (
        <EmptyState
          title={`No articles in ${category?.name || slug}`}
          description="There are currently no published articles in this category."
          actionLabel="Browse All Articles"
          actionLink="/blogs"
        />
      ) : (
        <>
          <div className="text-xs text-[#666666] mb-6">
            Showing <span className="font-semibold text-[#171717]">{blogs.length}</span> articles in this category
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <ArticleCard key={blog._id} blog={blog} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

export default CategoryPage;
