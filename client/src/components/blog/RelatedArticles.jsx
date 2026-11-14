import React from "react";
import ArticleCard from "./ArticleCard";

const RelatedArticles = ({ articles = [] }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="pt-10 border-t border-[#E5E5E5] mt-12">
      <div className="mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5] rounded-sm inline-block mb-2">
          Recommended Reading
        </span>
        <h3 className="text-xl font-bold text-[#171717]">
          Related Articles
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((blog) => (
          <ArticleCard key={blog._id} blog={blog} />
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
