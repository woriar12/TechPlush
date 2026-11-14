import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/adminService";
import { deleteBlog } from "../../services/blogService";
import AdminHeader from "../../components/admin/AdminHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import AccessibleDialog from "../../components/common/AccessibleDialog";
import { useToast } from "../../context/ToastContext";
import {
  CheckCircle,
  FileEdit,
  CalendarDays,
  ArrowRight,
  Trash2,
  Eye,
  BookOpen,
  FolderTree,
  Tags,
  Users,
  ArrowUpRight,
} from "lucide-react";

const AdminDashboardPage = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();
      if (response.success && response.data) setStats(response.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const response = await deleteBlog(deleteTarget._id);
      showToast(response.message || "Article deleted successfully");
      setDeleteTarget(null);
      await fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to delete article", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard statistics..." />;
  }

  if (error || !stats) {
    return <ErrorState message={error || "Dashboard statistics are unavailable"} onRetry={fetchStats} />;
  }

  const publishingMetrics = [
    { label: "Published", value: stats.publishedBlogs, icon: CheckCircle, link: "/admin/blogs?status=published" },
    { label: "Drafts", value: stats.draftBlogs, icon: FileEdit, link: "/admin/blogs?status=draft" },
    { label: "Scheduled", value: stats.scheduledBlogs, icon: CalendarDays, link: "/admin/blogs?status=scheduled" },
  ];
  const libraryMetrics = [
    { label: "Categories", value: stats.totalCategories, icon: FolderTree, link: "/admin/categories" },
    { label: "Tags", value: stats.totalTags, icon: Tags, link: "/admin/tags" },
    { label: "Authors", value: stats.totalAuthors, icon: Users, link: "/admin/authors" },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader title="Dashboard" />

      <section aria-label="Publication overview" className="grid gap-4 xl:grid-cols-12">
        <div className="border border-[#E5DED3] bg-white p-5 sm:p-6 xl:col-span-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#702F3B]">The newsroom</p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-[#292522]">Publishing pulse</h2>
            </div>
            <Link to="/admin/blogs" className="inline-flex items-center gap-1 text-xs font-semibold text-[#702F3B] hover:underline">
              Manage articles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 sm:divide-x sm:divide-[#E5DED3]">
            {publishingMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Link
                  key={metric.label}
                  to={metric.link}
                  className="group border-l-2 border-[#D5A441] px-4 py-2 transition-colors hover:bg-[#F8F5EF] sm:border-l-0 sm:first:pl-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#716B65]">{metric.label}</span>
                    <Icon className="h-4 w-4 text-[#702F3B]" aria-hidden="true" />
                  </div>
                  <p className="mt-2 font-heading text-3xl font-semibold text-[#292522]">
                    {Number(metric.value || 0).toLocaleString()}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <Link
          to="/admin/blogs"
          className="flex flex-col justify-between border border-[#E5DED3] bg-[#EFEAE0] p-5 transition-colors hover:bg-[#E9E1D4] sm:p-6 xl:col-span-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#702F3B]">Audience</p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-[#292522]">Total article views</h2>
            </div>
            <Eye className="h-5 w-5 text-[#702F3B]" aria-hidden="true" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <p className="font-heading text-4xl font-semibold text-[#702F3B]">
              {Number(stats.totalViews || 0).toLocaleString()}
            </p>
            <span className="text-xs text-[#716B65]">Across your archive</span>
          </div>
        </Link>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="overflow-hidden border border-[#E5DED3] bg-white xl:col-span-8">
          <div className="flex items-end justify-between gap-3 border-b border-[#E5DED3] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#702F3B]">Latest from the desk</p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-[#292522]">Recent articles</h2>
            </div>
            <Link to="/admin/blogs" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#702F3B] hover:underline">
              All articles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E5DED3]">
            {(stats.recentBlogs || []).map((blog) => {
              const date = blog.publishedAt || blog.scheduledAt || blog.createdAt;
              const statusClass = blog.status === "published"
                ? "bg-[#F3E8CC] text-[#702F3B]"
                : blog.status === "scheduled"
                  ? "bg-[#EFEAE0] text-[#292522]"
                  : "bg-[#F5F5F5] text-[#716B65]";

              return (
                <article key={blog._id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#FAF8F4] sm:flex-row sm:items-center sm:px-6">
                  {blog.featuredImage?.url ? (
                    <img
                      src={blog.featuredImage.url}
                      alt={blog.featuredImage.altText || blog.title}
                      loading="lazy"
                      className="h-16 w-24 shrink-0 border border-[#E5DED3] object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center border border-[#E5DED3] bg-[#F8F5EF]">
                      <BookOpen className="h-5 w-5 text-[#9A938A]" aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#702F3B]">
                        {blog.category?.name || "Uncategorized"}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-medium capitalize ${statusClass}`}>
                        {blog.status}
                      </span>
                    </div>
                    <h3 className="line-clamp-1 font-medium text-[#292522]">{blog.title}</h3>
                    <p className="mt-1 text-xs text-[#716B65]">
                      {blog.author?.name || "—"} <span aria-hidden="true">·</span>{" "}
                      {date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:justify-end">
                    <Link to={`/admin/blogs/edit/${blog._id}`} className="text-xs font-semibold text-[#702F3B] hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(blog)}
                      className="inline-flex items-center gap-1 text-xs text-[#716B65] hover:text-[#702F3B]"
                      aria-label={`Delete ${blog.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
            {(!stats.recentBlogs || stats.recentBlogs.length === 0) && (
              <p className="px-5 py-10 text-center text-sm text-[#716B65]">
                No articles have been created yet.
              </p>
            )}
          </div>
        </div>

        <aside className="border border-[#E5DED3] bg-white p-5 sm:p-6 xl:col-span-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#702F3B]">Your publication</p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-[#292522]">The building blocks</h2>
          <div className="mt-4 divide-y divide-[#E5DED3]">
            {libraryMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Link
                  key={metric.label}
                  to={metric.link}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 hover:text-[#702F3B]"
                >
                  <span className="flex h-9 w-9 items-center justify-center bg-[#F8F5EF] text-[#702F3B]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-sm text-[#716B65]">{metric.label}</span>
                  <span className="font-heading text-xl font-semibold text-[#292522]">
                    {Number(metric.value || 0).toLocaleString()}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#9A938A]" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </aside>
      </section>

      <AccessibleDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        labelledBy="delete-article-title"
        describedBy="delete-article-description"
        panelClassName="max-w-sm"
      >
          <div className="w-full max-w-sm border border-[#E5E5E5] bg-white p-6">
            <h2 id="delete-article-title" className="font-heading text-lg font-bold text-[#171717]">
              Delete this article?
            </h2>
            <p id="delete-article-description" className="mt-2 text-sm text-[#666666]">
              “{deleteTarget?.title}” will be permanently deleted. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                data-dialog-initial-focus
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="border border-[#D9D9D9] px-3 py-2 text-sm text-[#171717] hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-[#171717] px-3 py-2 text-sm font-medium text-white hover:bg-[#333333] disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete article"}
              </button>
            </div>
          </div>
      </AccessibleDialog>
    </div>
  );
};

export default AdminDashboardPage;
