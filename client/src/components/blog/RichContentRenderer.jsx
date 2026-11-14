import React from "react";

const renderNode = (node, index) => {
  if (!node) return null;

  if (node.type === "text") {
    let element = node.text;

    if (node.marks && Array.isArray(node.marks)) {
      node.marks.forEach((mark) => {
        if (mark.type === "bold") {
          element = <strong key={`bold-${index}`}>{element}</strong>;
        } else if (mark.type === "italic") {
          element = <em key={`italic-${index}`}>{element}</em>;
        } else if (mark.type === "code") {
          element = <code key={`code-${index}`}>{element}</code>;
        } else if (mark.type === "link") {
          element = (
            <a
              key={`link-${index}`}
              href={mark.attrs?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#171717] underline hover:text-[#333333] font-medium"
            >
              {element}
            </a>
          );
        }
      });
    }
    return <React.Fragment key={index}>{element}</React.Fragment>;
  }

  const children = node.content ? node.content.map(renderNode) : null;

  switch (node.type) {
    case "paragraph":
      return <p key={index}>{children}</p>;

    case "heading": {
      const level = node.attrs?.level || 2;
      const textContent = node.content?.map((c) => c.text).join("") || "";
      const id = textContent
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      const HeadingTag = `h${level}`;
      return (
        <HeadingTag key={index} id={id} className="scroll-mt-20">
          {children}
        </HeadingTag>
      );
    }

    case "bulletList":
      return <ul key={index}>{children}</ul>;

    case "orderedList":
      return <ol key={index}>{children}</ol>;

    case "listItem":
      return <li key={index}>{children}</li>;

    case "blockquote":
      return <blockquote key={index}>{children}</blockquote>;

    case "codeBlock": {
      const codeText = node.content?.map((c) => c.text).join("") || "";
      return (
        <pre key={index} className="overflow-x-auto">
          <code>{codeText}</code>
        </pre>
      );
    }

    case "image":
      return (
        <img
          key={index}
          src={node.attrs?.src}
          alt={node.attrs?.alt || "Illustration"}
          loading="lazy"
          className="rounded max-w-full my-4 mx-auto border border-gray-200"
        />
      );

    case "youtube":
    case "iframe":
      return (
        <div key={index} className="aspect-video w-full my-6 rounded overflow-hidden border border-gray-200">
          <iframe
            src={node.attrs?.src}
            title="Video Embed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );

    case "video":
      return (
        <div key={index} className="aspect-video w-full my-6 rounded overflow-hidden border border-gray-200">
          <video
            src={node.attrs?.src}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      );

    case "table":
      return (
        <div key={index} className="overflow-x-auto my-4">
          <table className="w-full border-collapse border border-gray-200">
            <tbody>{children}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={index}>{children}</tr>;

    case "tableHeader":
      return (
        <th key={index} className="border border-[#E5E5E5] bg-[#F5F5F5] p-2.5 text-left font-semibold text-xs sm:text-sm">
          {children}
        </th>
      );

    case "tableCell":
      return (
        <td key={index} className="border border-gray-200 p-2.5 text-xs sm:text-sm">
          {children}
        </td>
      );

    case "hardBreak":
      return <br key={index} />;

    default:
      return <div key={index}>{children}</div>;
  }
};

const RichContentRenderer = ({ content }) => {
  if (!content) {
    return <p className="text-gray-500 italic">No content available for this article.</p>;
  }

  if (typeof content === "object" && content.type === "doc" && Array.isArray(content.content)) {
    return (
      <div className="article-content">
        {content.content.map(renderNode)}
      </div>
    );
  }

  if (typeof content === "string" && content.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.type === "doc" && Array.isArray(parsed.content)) {
        return (
          <div className="article-content">
            {parsed.content.map(renderNode)}
          </div>
        );
      }
    } catch (e) {
    }
  }

  return (
    <div className="article-content">
      <p className="whitespace-pre-line">{String(content)}</p>
    </div>
  );
};

export default RichContentRenderer;
