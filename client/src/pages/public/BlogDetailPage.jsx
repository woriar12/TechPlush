import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogBySlug } from "../../services/blogService";
import RichContentRenderer from "../../components/blog/RichContentRenderer";
import TableOfContents from "../../components/blog/TableOfContents";
import ShareButtons from "../../components/blog/ShareButtons";
import AuthorCard from "../../components/blog/AuthorCard";
import ArticleNavigation from "../../components/blog/ArticleNavigation";
import RelatedArticles from "../../components/blog/RelatedArticles";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { Calendar, Clock, Eye, ArrowLeft, User } from "lucide-react";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBlogBySlug(slug);
      if (res.success && res.data) {
        setBlogData(res.data);

        const blog = res.data.blog;
        const metaTitle = blog.seo?.metaTitle || blog.title;
        document.title = `${metaTitle} | TechPulse`;

        const metaDesc = blog.seo?.metaDescription || blog.excerpt || "";
        let metaTag = document.querySelector('meta[name="description"]');
        if (!metaTag) {
          metaTag = document.createElement("meta");
          metaTag.name = "description";
          document.head.appendChild(metaTag);
        }
        metaTag.content = metaDesc;

        const setMeta = (attrName, attrValue, content) => {
          let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
          if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute(attrName, attrValue);
            document.head.appendChild(tag);
          }
          tag.setAttribute("content", content || "");
        };

        setMeta("property", "og:title", `${metaTitle} | TechPulse`);
        setMeta("property", "og:description", metaDesc);
        setMeta("property", "og:url", window.location.href);
        setMeta("property", "og:type", "article");
        if (blog.featuredImage?.url) {
          setMeta("property", "og:image", blog.featuredImage.url);
          setMeta("name", "twitter:image", blog.featuredImage.url);
        }
        setMeta("name", "twitter:title", `${metaTitle} | TechPulse`);
        setMeta("name", "twitter:description", metaDesc);

        const structuredData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          description: metaDesc,
          image: blog.featuredImage?.url ? [blog.featuredImage.url] : [],
          datePublished: blog.publishedAt,
          dateModified: blog.updatedAt,
          author: {
            "@type": "Person",
            name: blog.author?.name || "Author",
          },
          publisher: {
            "@type": "Organization",
            name: "TechPulse",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": window.location.href,
          },
        };

        let ldJsonScript = document.getElementById("json-ld-article");
        if (!ldJsonScript) {
          ldJsonScript = document.createElement("script");
          ldJsonScript.id = "json-ld-article";
          ldJsonScript.type = "application/ld+json";
          document.head.appendChild(ldJsonScript);
        }
        ldJsonScript.textContent = JSON.stringify(structuredData);
      }
    } catch (err) {
      console.error("Failed to load article:", err);
      setError(err.response?.data?.message || err.message || "Article not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      const script = document.getElementById("json-ld-article");
      if (script) script.remove();
    };
  }, [slug]);

  if (loading) {
    return <LoadingSpinner message="Loading blog..." minHeight="min-h-[50vh]" />;
  }

  if (error || !blogData?.blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState
          title="Blog Not Found"
          message={error || "This blog could not be loaded."}
          onRetry={fetchArticle}
        />
        <div className="text-center mt-4">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#171717] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Blogs</span>
          </Link>
        </div>
      </div>
    );
  }

  const { blog, relatedBlogs, previousBlog, nextBlog } = blogData;

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category & Back Link */}
      <div className="flex items-center justify-between text-xs text-[#666666] mb-5">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 font-medium hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Blogs</span>
        </Link>

        {blog.category && (
          <Link
            to={`/category/${blog.category.slug}`}
            className="font-bold text-[#171717] uppercase tracking-wider text-xs hover:underline"
          >
            {blog.category.name}
          </Link>
        )}
      </div>

      {/* Title */}
      <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#171717] leading-tight mb-4 tracking-tight">
        {blog.title}
      </h1>

      {/* Meta Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] py-3.5 border-t border-b border-[#E5E5E5] mb-8">
        <div className="flex items-center gap-2 font-medium text-[#171717]">
          {blog.author?.profileImage?.url ? (
            <img
              src={blog.author.profileImage.url}
              alt={blog.author.name}
              className="w-6 h-6 rounded-full object-cover border border-[#E5E5E5]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#171717] border border-[#E5E5E5]">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
          <span>{blog.author?.name || "Staff Author"}</span>
        </div>

        <span>•</span>

        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#888888]" />
          {formattedDate}
        </span>

        <span>•</span>

        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#888888]" />
          {blog.readingTime || 4} min read
        </span>

        {blog.views > 0 && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#888888]" />
              {blog.views} views
            </span>
          </>
        )}
      </div>

      {/* Featured Image */}
      {blog.featuredImage?.url && (
        <div className="mb-8 rounded-md overflow-hidden border border-[#E5E5E5] bg-[#F5F5F5] aspect-[16/9]">
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.altText || blog.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Excerpt Lead */}
      {blog.excerpt && (
        <p className="text-base sm:text-lg text-[#222222] font-medium leading-relaxed mb-8 border-l-2 border-[#171717] pl-4 py-3 bg-[#F5F5F5]">
          {blog.excerpt}
        </p>
      )}

      {/* Table of Contents */}
      <TableOfContents content={blog.content} />

      {/* Rich Article Body */}
      <div className="my-8">
        <RichContentRenderer content={blog.content} />
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="pt-6 border-t border-[#E5E5E5] my-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#171717] mr-1">Tags:</span>
            {blog.tags.map((tag) => (
              <span
                key={tag._id || tag}
                className="px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] text-[#171717] font-medium rounded-full text-xs shadow-xs"
              >
                #{tag.name || tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share Section */}
      <div className="flex items-center justify-between py-5 border-t border-b border-[#E5E5E5] my-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
          Share this blog
        </span>
        <ShareButtons title={blog.title} />
      </div>

      {/* Author Card */}
      <AuthorCard author={blog.author} />

      {/* Prev / Next Navigation */}
      <ArticleNavigation previousBlog={previousBlog} nextBlog={nextBlog} />

      {/* Related Articles */}
      <RelatedArticles articles={relatedBlogs} />
    </article>
  );
};

export default BlogDetailPage;
