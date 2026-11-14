import React, { useEffect, useState } from "react";
import { List } from "lucide-react";

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const extracted = [];
    if (content && typeof content === "object" && content.content) {
      const walk = (nodes) => {
        nodes.forEach((node) => {
          if (node.type === "heading" && node.attrs && (node.attrs.level === 2 || node.attrs.level === 3)) {
            const text = node.content?.map((c) => c.text).join("") || "";
            if (text.trim()) {
              const id = text
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");
              extracted.push({ id, text, level: node.attrs.level });
            }
          }
          if (node.content) {
            walk(node.content);
          }
        });
      };
      walk(content.content);
    }
    setHeadings(extracted);
  }, [content]);

  if (headings.length < 2) return null;

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-md p-5 my-8">
      <div className="flex items-center gap-2 font-bold text-[#171717] text-xs uppercase tracking-wider mb-3">
        <List className="w-3.5 h-3.5 text-[#171717]" />
        <span>Table of Contents</span>
      </div>
      <nav aria-label="Table of contents">
        <ul className="space-y-2 text-xs sm:text-sm">
          {headings.map((h, i) => (
            <li
              key={i}
              className={`${
                h.level === 3 ? "pl-4 text-xs text-[#666666]" : "font-semibold text-[#171717]"
              }`}
            >
              <button
                type="button"
                onClick={() => scrollToHeading(h.id)}
                className="hover:text-[#171717] text-left hover:underline cursor-pointer transition-colors"
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
