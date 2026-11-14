import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  createBlog,
  updateBlog,
  getBlogById,
} from "../../services/blogService";
import { getCategories } from "../../services/categoryService";
import { getTags } from "../../services/tagService";
import { getAuthors } from "../../services/authorService";
import AdminHeader from "../../components/admin/AdminHeader";
import TiptapEditor from "../../components/editor/TiptapEditor";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import {
  Save,
  ArrowLeft,
  Upload,
  Calendar,
  AlertCircle,
  Clock,
  Search,
} from "lucide-react";

const AdminBlogEditorPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState(null);
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [altText, setAltText] = useState("");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setPageLoading(true);

        const [catRes, tagRes, authRes] = await Promise.all([
          getCategories(),
          getTags(),
          getAuthors(),
        ]);

        if (catRes.success) setCategories(catRes.data || []);
        if (tagRes.success) setTags(tagRes.data || []);
        if (authRes.success) setAuthors(authRes.data || []);

        if (isEditMode) {
          const blogRes = await getBlogById(id);
          if (blogRes.success && blogRes.data) {
            const b = blogRes.data;
            setTitle(b.title || "");
            setExcerpt(b.excerpt || "");
            setContent(b.content || { type: "doc", content: [] });
            setCategory(b.category?._id || b.category || "");
            setSelectedTags(b.tags?.map((t) => t._id || t) || []);
            setAuthor(b.author?._id || b.author || "");
            setStatus(b.status || "draft");
            setIsFeatured(Boolean(b.isFeatured));
            setAltText(b.featuredImage?.altText || "");
            setExistingImageUrl(b.featuredImage?.url || "");

            if (b.scheduledAt) {
              const dt = new Date(b.scheduledAt);
              const iso = dt.toISOString().slice(0, 16);
              setScheduledAt(iso);
            }

            if (b.seo) {
              setMetaTitle(b.seo.metaTitle || "");
              setMetaDescription(b.seo.metaDescription || "");
              setKeywords(b.seo.keywords ? b.seo.keywords.join(", ") : "");
            }
          }
        }
      } catch (err) {
        setFormError(err.message || "Failed to load form dependencies");
      } finally {
        setPageLoading(false);
      }
    };

    loadDependencies();
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

      if (
        !allowedTypes.includes(file.type) ||
        !allowedExtensions.includes(extension)
      ) {
        setImageFile(null);
        setImagePreview("");
        e.target.value = "";
        showToast("Please choose a PNG, JPG, or WebP image", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setImageFile(null);
        setImagePreview("");
        e.target.value = "";
        showToast("Image file must be 5MB or smaller", "error");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required.");
      showToast("Title is required", "error");
      return;
    }

    if (!category) {
      setFormError("Please select a category.");
      showToast("Please select a category", "error");
      return;
    }

    if (!author) {
      setFormError("Please select an author.");
      showToast("Please select an author", "error");
      return;
    }

    if (!isEditMode && !imageFile) {
      setFormError("A featured image is required.");
      showToast("A featured image is required", "error");
      return;
    }

    if (!content || !content.content || content.content.length === 0) {
      setFormError("Article content cannot be empty.");
      showToast("Article content cannot be empty", "error");
      return;
    }

    if (status === "scheduled" && !scheduledAt) {
      setFormError("Scheduled date and time is required when scheduling.");
      showToast("Scheduled date/time required", "error");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("excerpt", excerpt.trim());
      formData.append("content", JSON.stringify(content));
      formData.append("category", category);
      formData.append("author", author);
      formData.append("status", status);
      formData.append("isFeatured", String(isFeatured));

      if (selectedTags.length > 0) {
        formData.append("tags", JSON.stringify(selectedTags));
      }

      if (status === "scheduled" && scheduledAt) {
        formData.append("scheduledAt", new Date(scheduledAt).toISOString());
      }

      if (altText) {
        formData.append("altText", altText.trim());
      }

      const seoObj = {
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        keywords: keywords
          ? keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : [],
      };
      formData.append("seo", JSON.stringify(seoObj));

      if (imageFile) {
        formData.append("featuredImage", imageFile);
      }

      let res;
      if (isEditMode) {
        res = await updateBlog(id, formData);
        showToast("Article updated successfully!");
      } else {
        res = await createBlog(formData);
        showToast("Article created successfully!");
      }

      navigate("/admin/blogs");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to save article";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner message="Loading article editor..." />;
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={isEditMode ? "Edit Article" : "Create New Article"}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {formError && (
          <div id="article-form-error" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-[#B42333] rounded text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Action Header */}
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded border border-[#E5E5E5] shadow-sm sticky top-16 z-10">
          <Link
            to="/admin/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666666] hover:text-[#171717]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#171717] hover:bg-[#333333] text-white font-medium text-sm rounded shadow-sm disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : isEditMode ? "Update Article" : "Save Article"}</span>
          </button>
        </div>

        {/* Basic Article Details */}
        <div className="bg-white p-6 rounded border border-[#E5E5E5] shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#171717] border-b border-[#E5E5E5] pb-2">
            Article Information
          </h2>

          <div>
            <label htmlFor="article-title" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
              Article Title *
            </label>
            <input
              type="text"
              id="article-title"
              required
              aria-required="true"
              aria-invalid={Boolean(formError && formError.includes("Title"))}
              aria-describedby={formError && formError.includes("Title") ? "article-form-error" : undefined}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Event-Driven Pipelines with Node.js and Kafka"
              className="w-full px-3 py-2 text-base font-medium bg-white text-[#171717] rounded border border-[#E5E5E5] focus:border-[#171717] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="article-excerpt" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
              Short Summary / Excerpt
            </label>
            <textarea
              rows={3}
              id="article-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary to display on article cards and search results..."
              className="w-full px-3 py-2 bg-white text-[#171717] rounded border border-[#E5E5E5] focus:border-[#171717] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="article-content" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2">
              Article Content *
            </label>
            <TiptapEditor
              content={content}
              onChange={(json) => setContent(json)}
              id="article-content"
              ariaInvalid={Boolean(formError && formError.includes("content"))}
              ariaDescribedBy={formError && formError.includes("content") ? "article-form-error" : undefined}
            />
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white p-6 rounded border border-[#E5E5E5] shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#171717] border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#171717]" />
            <span>{isEditMode ? "Featured Image" : "Featured Image *"}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <input
                ref={fileInputRef}
                id="featured-image"
                type="file"
                aria-label="Choose featured image"
                aria-required={!isEditMode}
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={imageFile ? `Replace featured image: ${imageFile.name}` : isEditMode ? "Choose featured image" : "Choose featured image (required)"}
                aria-invalid={Boolean(formError && formError.includes("featured image"))}
                aria-describedby={formError && formError.includes("featured image") ? "article-form-error" : "featured-image-help"}
                className="w-full border-2 border-dashed border-[#E5E5E5] hover:border-[#171717] bg-[#FAFAFA] hover:bg-[#F5F5F5] rounded p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[140px]"
              >
                <Upload className="w-6 h-6 text-[#666666] mb-2" />
                <span className="block text-sm font-medium text-[#171717]">
                  {imageFile ? imageFile.name : "Choose an image file"}
                </span>
                <span id="featured-image-help" className="mt-1 text-xs text-[#666666]">PNG, JPG, WebP up to 5MB</span>
              </button>
            </div>

            <div className="aspect-[16/10] rounded bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center overflow-hidden">
              {imagePreview || existingImageUrl ? (
                <img
                  src={imagePreview || existingImageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-[#666666]">No image selected yet</span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="image-alt-text" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
              Image Alt Text
            </label>
            <input
              type="text"
              id="image-alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive text for accessibility and search engines"
              className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
            />
          </div>
        </div>

        {/* Category, Author & Tags */}
        <div className="bg-white p-6 rounded border border-[#E5E5E5] shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#171717] border-b border-[#E5E5E5] pb-2">
            Categorization & Author
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="article-category" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                Category *
              </label>
              <select
                required
                id="article-category"
                aria-required="true"
                aria-invalid={Boolean(formError && formError.includes("category"))}
                aria-describedby={formError && formError.includes("category") ? "article-form-error" : undefined}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm font-medium text-[#171717] focus:border-[#171717] focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="article-author" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                Author *
              </label>
              <select
                required
                id="article-author"
                aria-required="true"
                aria-invalid={Boolean(formError && formError.includes("author"))}
                aria-describedby={formError && formError.includes("author") ? "article-form-error" : undefined}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm font-medium text-[#171717] focus:border-[#171717] focus:outline-none"
              >
                <option value="">Select Author</option>
                {authors.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.designation || "Author"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span id="article-tags-label" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2">
              Tags
            </span>
            <div role="group" aria-labelledby="article-tags-label" className="flex flex-wrap gap-2 p-3 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
              {tags.map((t) => {
                const isSelected = selectedTags.includes(t._id);
                return (
                  <button
                    key={t._id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleTagToggle(t._id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-[#171717] text-white border border-[#171717]"
                        : "bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-white p-6 rounded border border-[#E5E5E5] shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#171717] border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#171717]" />
            <span>Publishing Options</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-3 rounded border flex items-center gap-2.5 cursor-pointer transition-colors ${
                status === "draft"
                  ? "border-[#171717] bg-[#FAFAFA]"
                  : "border-[#E5E5E5] hover:border-[#171717]"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={(e) => setStatus(e.target.value)}
                className="text-[#171717] accent-[#171717]"
              />
              <div>
                <span className="block text-sm font-medium text-[#171717]">Draft</span>
                <span className="text-xs text-[#666666]">Keep private for now</span>
              </div>
            </label>

            <label
              className={`p-3 rounded border flex items-center gap-2.5 cursor-pointer transition-colors ${
                status === "published"
                  ? "border-[#171717] bg-[#F5F5F5]"
                  : "border-[#E5E5E5] hover:border-[#171717]"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={(e) => setStatus(e.target.value)}
                className="text-[#171717] accent-[#171717]"
              />
              <div>
                <span className="block text-sm font-medium text-[#171717]">Publish</span>
                <span className="text-xs text-[#666666]">Make live immediately</span>
              </div>
            </label>

            <label
              className={`p-3 rounded border flex items-center gap-2.5 cursor-pointer transition-colors ${
                status === "scheduled"
                  ? "border-[#171717] bg-[#FAFAFA]"
                  : "border-[#E5E5E5] hover:border-[#171717]"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="scheduled"
                checked={status === "scheduled"}
                onChange={(e) => setStatus(e.target.value)}
                className="text-[#171717] accent-[#171717]"
              />
              <div>
                <span className="block text-sm font-medium text-[#171717]">Schedule</span>
                <span className="text-xs text-[#666666]">Publish at future time</span>
              </div>
            </label>
          </div>

          {status === "scheduled" && (
            <div className="p-3 bg-[#FAFAFA] rounded border border-[#E5E5E5] max-w-sm">
              <label htmlFor="article-scheduled-at" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                id="article-scheduled-at"
                required
                aria-required="true"
                aria-invalid={Boolean(formError && formError.includes("Scheduled"))}
                aria-describedby={formError && formError.includes("Scheduled") ? "article-form-error" : undefined}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
              />
            </div>
          )}

          <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
            <div>
              <label htmlFor="article-featured" className="block text-sm font-medium text-[#171717]">Featured Article</label>
              <span className="text-xs text-[#666666]">Highlight on the homepage featured section</span>
            </div>
            <input
              id="article-featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-[#171717] accent-[#171717] rounded border-[#E5E5E5]"
            />
          </div>
        </div>

        {/* SEO Details */}
        <div className="bg-white p-6 rounded border border-[#E5E5E5] shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#171717] border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#171717]" />
            <span>Search Engine Optimization (SEO)</span>
          </h2>

          <div>
            <label htmlFor="seo-meta-title" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
              Meta Title (Max 70 chars)
            </label>
            <input
              type="text"
              id="seo-meta-title"
              maxLength={70}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={title || "Custom search engine title"}
              className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="seo-meta-description" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
              Meta Description (Max 160 chars)
            </label>
            <textarea
              rows={2}
              id="seo-meta-description"
              maxLength={160}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder={excerpt || "Search engine description snippet..."}
              className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="seo-keywords" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
              Keywords (Comma-separated)
            </label>
            <input
              type="text"
              id="seo-keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Node.js, Web Development, Microservices"
              className="w-full px-3 py-2 bg-white rounded border border-[#E5E5E5] text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEditorPage;
