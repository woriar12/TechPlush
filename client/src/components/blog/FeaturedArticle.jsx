import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";

const FeaturedArticle = ({ blog }) => {
  if (!blog) return null;

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-md overflow-hidden p-5 sm:p-6 mb-10 hover:border-[#171717]/40 transition-colors">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Featured Image */}
        <Link
          to={`/blog/${blog.slug}`}
          className="w-full md:w-5/12 aspect-[16/10] bg-[#F5F5F5] rounded overflow-hidden shrink-0 border border-[#E5E5E5]"
        >
          {blog.featuredImage?.url ? (
            <img
              src={blog.featuredImage.url}
              alt={blog.featuredImage.altText || blog.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#888888]">
              TechPulse article
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm mb-3">
              <span className="font-semibold px-2.5 py-0.5 bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5] rounded text-xs">
                Featured Post
              </span>
              {blog.category && (
                <span className="text-[#666666] font-medium">
                  {blog.category.name}
                </span>
              )}
              <span className="text-[#CCCCCC]">•</span>
              <span className="text-[#777777] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171717] hover:text-[#333333] mb-3 leading-snug">
              <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
            </h2>

            <p className="text-sm sm:text-base text-[#555555] leading-relaxed line-clamp-3 mb-5">
              {blog.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3.5 border-t border-[#E5E5E5] text-sm">
            <div className="flex items-center gap-2.5">
              {blog.author?.profileImage?.url ? (
                <img
                  src={blog.author.profileImage.url}
                  alt={blog.author?.name || "Author"}
                  className="w-6 h-6 rounded-full object-cover border border-[#E5E5E5] shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5] flex items-center justify-center text-xs font-bold shrink-0">
                  {blog.author?.name ? (
                    blog.author.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#666666]" />
                  )}
                </div>
              )}
              <span className="text-[#666666] flex items-center gap-2">
                <span>By <strong className="text-[#171717]">{blog.author?.name || "Admin"}</strong></span>
                <span className="text-[#CCCCCC]">•</span>
                <span className="text-[#777777] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {blog.readingTime || 4} min read
                </span>
              </span>
            </div>

            <Link
              to={`/blog/${blog.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171717] text-white text-xs sm:text-sm font-medium rounded hover:bg-[#333333] transition-colors"
            >
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedArticle;
