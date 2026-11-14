import React, { useEffect, useState } from "react";
import {
  getAdminTags,
  createTag,
  updateTag,
  deleteTag,
} from "../../services/tagService";
import AdminHeader from "../../components/admin/AdminHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import AccessibleDialog from "../../components/common/AccessibleDialog";
import { useToast } from "../../context/ToastContext";
import {
  PlusCircle,
  FileEdit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
  AlertCircle,
} from "lucide-react";

const AdminTagPage = () => {
  const { showToast } = useToast();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminTags();
      if (!res.success) {
        throw new Error(res.message || "Failed to load tags");
      }
      setTags(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setDescription(tag.description || "");
    setIsActive(tag.isActive);
    setModalError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!name.trim()) {
      setModalError("Tag name is required.");
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        isActive,
      };

      if (editingTag) {
        await updateTag(editingTag._id, payload);
        showToast("Tag updated successfully!");
      } else {
        await createTag(payload);
        showToast("Tag created successfully!");
      }

      setModalOpen(false);
      fetchTags();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save tag";
      setModalError(msg);
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await deleteTag(id);
      showToast("Tag deleted successfully!");
      setDeleteConfirmId(null);
      fetchTags();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Cannot delete tag";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (tag) => {
    try {
      const res = await updateTag(tag._id, { isActive: !tag.isActive });
      if (res.success && res.data) {
        setTags((currentTags) =>
          currentTags.map((currentTag) =>
            currentTag._id === tag._id ? res.data : currentTag
          )
        );
        showToast(`Tag ${res.data.isActive ? "activated" : "deactivated"}!`);
      } else {
        throw new Error(res.message || "Failed to update status");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to update status", "error");
    }
  };

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminHeader title="Tags" />

      {/* Control bar */}
      <div className="bg-white p-4 rounded border border-[#E5E5E5] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <label htmlFor="tag-search" className="sr-only">Search tags</label>
          <input
            id="tag-search"
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-[#171717] placeholder-[#666666] text-sm rounded border border-[#E5E5E5] focus:border-[#171717] focus:outline-none"
          />
          <Search aria-hidden="true" className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#171717] hover:bg-[#333333] text-white text-sm font-medium rounded shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Tag</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading tags..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTags} />
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-[#666666] bg-white rounded border border-[#E5E5E5]">
          No tags found. Click "New Tag" to create one.
        </div>
      ) : (
        <div className="bg-white rounded border border-[#E5E5E5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#171717]">
              <thead className="bg-[#FAFAFA] text-xs uppercase tracking-wider text-[#666666] font-semibold border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-5 py-3">Tag Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]/50">
                {filtered.map((tag) => (
                  <tr key={tag._id} className="hover:bg-[#FAFAFA]/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#171717]">
                      <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-xs text-[#171717] font-mono">
                        #{tag.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-[#666666]">
                      /{tag.slug}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#666666] max-w-xs truncate">
                      {tag.description || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(tag)}
                        aria-label={`${tag.isActive ? "Deactivate" : "Activate"} ${tag.name}`}
                        aria-pressed={tag.isActive}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          tag.isActive
                            ? "bg-[#171717] text-white border border-[#171717]"
                            : "bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5]"
                        }`}
                      >
                        {tag.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{tag.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(tag)}
                          aria-label={`Edit ${tag.name}`}
                          className="p-1 text-[#171717] hover:text-[#333333] hover:bg-[#FAFAFA] rounded transition-colors"
                          title="Edit Tag"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(tag._id)}
                          aria-label={`Delete ${tag.name}`}
                          className="p-1 text-[#DC3545] hover:text-red-700 hover:bg-gray-100 rounded transition-colors"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AccessibleDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        labelledBy="tag-dialog-title"
        panelClassName="max-w-md"
      >
          <div className="bg-white rounded border border-[#E5E5E5] p-6 max-w-md w-full shadow-lg relative">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#666666] hover:text-[#171717] p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 id="tag-dialog-title" className="text-base font-bold text-[#171717] mb-4">
              {editingTag ? "Edit Tag" : "Create New Tag"}
            </h3>

            {modalError && (
              <div id="tag-modal-error" className="mb-4 p-2.5 bg-red-50 border border-red-200 text-[#B42333] text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} aria-describedby={modalError ? "tag-modal-error" : undefined} className="space-y-4">
              <div>
                <label htmlFor="tag-name" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  id="tag-name"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(modalError)}
                  data-dialog-initial-focus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Microservices"
                  className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm font-medium text-[#171717] focus:border-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="tag-description" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  id="tag-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this tag..."
                  className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                />
              </div>

              {editingTag && (
                <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                  <label htmlFor="tag-active" className="text-xs font-medium text-[#171717]">Tag Active</label>
                  <input
                    id="tag-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#171717] accent-[#171717] rounded border-[#E5E5E5]"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded border border-[#E5E5E5] text-[#171717] text-sm font-medium hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 px-3 rounded bg-[#171717] hover:bg-[#333333] text-white text-sm font-medium shadow-sm disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? "Saving..." : editingTag ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
      </AccessibleDialog>

      {/* Delete Confirmation Modal */}
      <AccessibleDialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        labelledBy="tag-delete-title"
        describedBy="tag-delete-description"
        panelClassName="max-w-sm"
      >
          <div className="bg-white rounded border border-[#E5E5E5] p-6 max-w-sm w-full shadow-lg">
            <h3 id="tag-delete-title" className="text-base font-bold text-[#171717] mb-2">Delete Tag?</h3>
            <p id="tag-delete-description" className="text-sm text-[#666666] mb-5">
              Are you sure? Removing this tag will detach it from any existing articles.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-dialog-initial-focus
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 px-3 rounded border border-[#E5E5E5] text-[#171717] text-sm font-medium hover:bg-[#FAFAFA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoading}
                className="flex-1 py-2 px-3 rounded bg-[#DC3545] text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
      </AccessibleDialog>
    </div>
  );
};

export default AdminTagPage;
