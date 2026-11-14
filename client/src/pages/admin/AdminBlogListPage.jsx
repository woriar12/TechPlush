import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAdminBlogs,
  deleteBlog,
  togglePublishBlog,
} from "../../services/blogService";
import { getCategories } from "../../services/categoryService";
import AdminHeader from "../../components/admin/AdminHeader";
import Pagination from "../../components/common/Pagination";
import AccessibleDialog from "../../components/common/AccessibleDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { Search, Plus } from "lucide-react";

const AdminBlogListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statusFilter = searchParams.get("status") || "";
  const categoryFilter = searchParams.get("category") || "";
  const searchFilter = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch((e) => console.error(e));
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
      };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchFilter) params.search = searchFilter;

      const res = await getAdminBlogs(params);
      if (res.success) {
        setBlogs(res.data?.blogs || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter, categoryFilter, searchFilter, currentPage]);

  const handleStatusChange = (status) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set("status", status);
    else next.delete("status");
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleCategoryChange = (catId) => {
    const next = new URLSearchParams(searchParams);
    if (catId) next.set("category", catId);
    else next.delete("category");
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handleTogglePublish = async (blog) => {
    try {
      setActionLoading(true);
      const res = await togglePublishBlog(blog._id);
      showToast(res.message || "Status updated");
      fetchBlogs();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      const res = await deleteBlog(id);
      showToast(res.message || "Blog deleted successfully");
      setDeleteConfirmId(null);
      fetchBlogs();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete blog", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Articles" />

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-md border border-[#E5E5E5]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <label htmlFor="admin-blog-search" className="sr-only">Search articles by title</label>
            <input
              id="admin-blog-search"
              type="text"
              placeholder="Search by title..."
              value={searchFilter}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set("search", e.target.value);
                else next.delete("search");
                next.set("page", "1");
                setSearchParams(next);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded text-[#171717] placeholder-[#716B65] focus:outline-none focus:border-[#171717]"
            />
            <Search aria-hidden="true" className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Category & Status Selectors + Create Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter articles by category"
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded text-[#171717] focus:outline-none focus:border-[#171717]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter articles by status"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#E5E5E5] rounded text-[#171717] focus:outline-none focus:border-[#171717]"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <Link
              to="/admin/blogs/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Blog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Normal Data Table */}
      {loading ? (
        <LoadingSpinner message="Loading articles..." minHeight="min-h-[250px]" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBlogs} />
      ) : blogs.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Try adjusting your search criteria or create a new article."
          actionLabel="Create Blog"
          actionLink="/admin/blogs/create"
        />
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-[#171717]">
              <thead className="bg-[#FAFAFA] text-[11px] uppercase tracking-wider text-[#666666] font-semibold border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {blogs.map((b) => {
                  const dateStr = b.publishedAt
                    ? new Date(b.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : b.scheduledAt
                    ? `Sched: ${new Date(b.scheduledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}`
                    : "Draft";

                  return (
                    <tr key={b._id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#171717] max-w-xs truncate">
                        {b.title}
                      </td>

                      <td className="px-4 py-3 text-xs text-[#666666]">
                        {b.category?.name || "Uncategorized"}
                      </td>

                      <td className="px-4 py-3 text-xs text-[#666666]">
                        {b.author?.name || "—"}
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(b)}
                          disabled={actionLoading}
                          aria-label={`Change publication status for ${b.title}, currently ${b.status}`}
                          title="Click to toggle status"
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize cursor-pointer hover:opacity-80 ${
                            b.status === "published"
                              ? "bg-[#171717] text-white border border-[#171717]"
                              : b.status === "scheduled"
                              ? "bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5]"
                              : "bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5]"
                          }`}
                        >
                          {b.status}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-xs text-[#666666]">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right text-xs space-x-2">
                        {b.status === "published" && (
                          <Link
                            to={`/blog/${b.slug}`}
                            target="_blank"
                            className="text-[#666666] hover:text-[#171717] hover:underline"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          to={`/admin/blogs/edit/${b._id}`}
                          className="text-[#171717] hover:underline font-semibold"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(b._id)}
                          className="text-[#B42333] hover:underline font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-[#E5E5E5]">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => {
                const next = new URLSearchParams(searchParams);
                next.set("page", p.toString());
                setSearchParams(next);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AccessibleDialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        labelledBy="blog-delete-title"
        describedBy="blog-delete-description"
        panelClassName="max-w-sm"
      >
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border border-[#E5E5E5]">
            <h3 id="blog-delete-title" className="text-base font-bold text-[#171717] mb-2">Delete Blog</h3>
            <p id="blog-delete-description" className="text-xs text-[#666666] mb-5">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                data-dialog-initial-focus
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 border border-[#E5E5E5] rounded-lg text-[#171717] hover:bg-[#FAFAFA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoading}
                className="px-3.5 py-2 bg-[#DC3545] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
      </AccessibleDialog>
    </div>
  );
};

export default AdminBlogListPage;
