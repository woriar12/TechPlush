import React, { useEffect, useState, useRef } from "react";
import {
  getAdminAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../../services/authorService";
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
  Upload,
  Globe,
  User,
  AlertCircle,
} from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "../../components/common/SocialIcons";

const AdminAuthorPage = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminAuthors();
      if (res.success) {
        setAuthors(res.data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const openCreateModal = () => {
    setEditingAuthor(null);
    setName("");
    setDesignation("");
    setBio("");
    setLinkedin("");
    setTwitter("");
    setWebsite("");
    setIsActive(true);
    setImageFile(null);
    setImagePreview("");
    setExistingImageUrl("");
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (author) => {
    setEditingAuthor(author);
    setName(author.name);
    setDesignation(author.designation || "");
    setBio(author.bio || "");
    setLinkedin(author.socialLinks?.linkedin || "");
    setTwitter(author.socialLinks?.twitter || "");
    setWebsite(author.socialLinks?.website || "");
    setIsActive(author.isActive);
    setImageFile(null);
    setImagePreview("");
    setExistingImageUrl(author.profileImage?.url || "");
    setModalError("");
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please choose an image file", "error");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!name.trim()) {
      setModalError("Author name is required");
      return;
    }

    try {
      setActionLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("designation", designation.trim());
      formData.append("bio", bio.trim());

      const socialLinksObj = {
        linkedin: linkedin.trim(),
        twitter: twitter.trim(),
        website: website.trim(),
      };
      formData.append("socialLinks", JSON.stringify(socialLinksObj));

      if (editingAuthor) {
        formData.append("isActive", String(isActive));
      }

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      if (editingAuthor) {
        await updateAuthor(editingAuthor._id, formData);
        showToast("Author profile updated successfully!");
      } else {
        await createAuthor(formData);
        showToast("Author created successfully!");
      }

      setModalOpen(false);
      fetchAuthors();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save author";
      setModalError(msg);
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await deleteAuthor(id);
      showToast("Deleted successfully");
      setDeleteConfirmId(null);
      fetchAuthors();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Cannot delete author";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (author) => {
    try {
      const formData = new FormData();
      formData.append("isActive", String(!author.isActive));
      await updateAuthor(author._id, formData);
      showToast(`Author profile ${!author.isActive ? "activated" : "deactivated"}!`);
      fetchAuthors();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update author status", "error");
    }
  };

  const filtered = authors.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.designation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminHeader title="Authors" />

      {/* Control bar */}
      <div className="bg-white p-4 rounded border border-[#E5E5E5] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <label htmlFor="author-search" className="sr-only">Search authors</label>
          <input
            id="author-search"
            type="text"
            placeholder="Search authors..."
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
          <span>New Author</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading authors..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAuthors} />
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-[#666666] bg-white rounded border border-[#E5E5E5]">
          No authors found. Click "New Author" to create one.
        </div>
      ) : (
        <div className="bg-white rounded border border-[#E5E5E5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#171717]">
              <thead className="bg-[#FAFAFA] text-xs uppercase tracking-wider text-[#666666] font-semibold border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Designation</th>
                  <th className="px-5 py-3">Social Profiles</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]/50">
                {filtered.map((author) => (
                  <tr key={author._id} className="hover:bg-[#FAFAFA]/60 transition-colors">
                    <td className="px-5 py-3 max-w-sm">
                      <div className="flex items-center gap-3">
                        {author.profileImage?.url ? (
                          <img
                            src={author.profileImage.url}
                            alt={author.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#E5E5E5] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#F5F5F5] text-[#171717] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[#E5E5E5]">
                            {author.name ? author.name.charAt(0) : <User className="w-4 h-4" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-medium text-[#171717] truncate">
                            {author.name}
                          </h4>
                          <p className="text-xs text-[#666666] truncate font-mono">
                            /{author.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-xs text-[#666666]">
                      {author.designation || "Staff Writer"}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {author.socialLinks?.linkedin && (
                          <a
                            href={author.socialLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#666666] hover:text-[#171717] transition-colors"
                            aria-label="LinkedIn"
                          >
                            <LinkedinIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {author.socialLinks?.twitter && (
                          <a
                            href={author.socialLinks.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#666666] hover:text-[#171717] transition-colors"
                            aria-label="Twitter"
                          >
                            <TwitterIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {author.socialLinks?.website && (
                          <a
                            href={author.socialLinks.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#666666] hover:text-[#171717] transition-colors"
                            aria-label="Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {!author.socialLinks?.linkedin && !author.socialLinks?.twitter && !author.socialLinks?.website && (
                          <span className="text-[#666666] text-xs">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(author)}
                        aria-label={`${author.isActive ? "Deactivate" : "Activate"} ${author.name}`}
                        aria-pressed={author.isActive}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          author.isActive
                            ? "bg-[#171717] text-white border border-[#171717]"
                            : "bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5]"
                        }`}
                      >
                        {author.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{author.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(author)}
                          aria-label={`Edit ${author.name}`}
                          className="p-1 text-[#171717] hover:text-[#333333] hover:bg-[#FAFAFA] rounded transition-colors"
                          title="Edit Author"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(author._id)}
                          aria-label={`Delete ${author.name}`}
                          className="p-1 text-[#DC3545] hover:text-red-700 hover:bg-gray-100 rounded transition-colors"
                          title="Delete Author"
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

      {/* Modal */}
      <AccessibleDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        labelledBy="author-dialog-title"
        panelClassName="max-w-lg"
      >
          <div className="bg-white rounded border border-[#E5E5E5] p-6 max-w-lg w-full shadow-lg relative my-8">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#666666] hover:text-[#171717] p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 id="author-dialog-title" className="text-base font-bold text-[#171717] mb-4">
              {editingAuthor ? "Edit Author Profile" : "Create Author Profile"}
            </h3>

            {modalError && (
              <div id="author-modal-error" className="mb-4 p-2.5 bg-red-50 border border-red-200 text-[#B42333] text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} aria-describedby={modalError ? "author-modal-error" : undefined} className="space-y-4">
              {/* Profile Image Picker */}
              <div className="flex items-center gap-4 p-3 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                <input
                  ref={fileInputRef}
                  type="file"
                  aria-label="Choose author profile picture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex-shrink-0 border border-[#E5E5E5] flex items-center justify-center">
                  {imagePreview || existingImageUrl ? (
                    <img
                      src={imagePreview || existingImageUrl}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-[#666666]" />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    aria-label="Upload author profile picture"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#171717] text-xs font-medium text-[#171717] rounded shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#171717]" />
                    <span>Upload Picture</span>
                  </button>
                  <p className="text-[11px] text-[#666666] mt-1">PNG, JPG to Cloudinary</p>
                </div>
              </div>

              <div>
                <label htmlFor="author-name" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="author-name"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(modalError)}
                  data-dialog-initial-focus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm font-medium text-[#171717] focus:border-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="author-designation" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  id="author-designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Software Architect"
                  className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="author-bio" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                  Biography
                </label>
                <textarea
                  rows={3}
                  id="author-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short background and expertise..."
                  className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label htmlFor="author-linkedin" className="block text-[11px] font-semibold text-[#666666] mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="author-linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-[#E5E5E5] text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="author-twitter" className="block text-[11px] font-semibold text-[#666666] mb-1">
                    Twitter / X URL
                  </label>
                  <input
                    type="url"
                    id="author-twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-[#E5E5E5] text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="author-website" className="block text-[11px] font-semibold text-[#666666] mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="author-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-[#E5E5E5] text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
                  />
                </div>
              </div>

              {editingAuthor && (
                <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                  <label htmlFor="author-active" className="text-xs font-medium text-[#171717]">Author Active</label>
                  <input
                    id="author-active"
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
                  {actionLoading ? "Saving..." : editingAuthor ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
      </AccessibleDialog>

      {/* Delete Confirmation Modal */}
      <AccessibleDialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        labelledBy="author-delete-title"
        describedBy="author-delete-description"
        panelClassName="max-w-sm"
      >
          <div className="bg-white rounded border border-[#E5E5E5] p-6 max-w-sm w-full shadow-lg">
            <h3 id="author-delete-title" className="text-base font-bold text-[#171717] mb-2">Delete Author and Articles?</h3>
            <p id="author-delete-description" className="text-sm text-[#666666] mb-5">
              This permanently deletes the author and every article assigned to them, including their featured images. This cannot be undone.
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
                {actionLoading ? "Deleting..." : "Delete Author & Articles"}
              </button>
            </div>
          </div>
      </AccessibleDialog>
    </div>
  );
};

export default AdminAuthorPage;