import React from "react";
import { Link } from "react-router-dom";

const ArticleCard = ({ blog }) => {
  if (!blog) return null;

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <article className="article-card">
      <Link
        to={`/blog/${blog.slug}`}
        className="article-card__image"
      >
        {blog.featuredImage?.url ? (
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.altText || blog.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="magazine-image-placeholder">TechPulse article</div>
        )}
      </Link>

      <div className="article-card__content">
        <div className="article-card__metadata">
          <span>{blog.category?.name || "Technology"}</span>
          <time dateTime={blog.publishedAt || undefined}>{formattedDate}</time>
        </div>

        <h3 className="article-card__title">
          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="article-card__excerpt">
          {blog.excerpt}
        </p>

        <div className="article-card__footer">
          <span>{blog.author?.name || "TechPulse"}</span>
          <span>{blog.readingTime || 4} min read</span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
