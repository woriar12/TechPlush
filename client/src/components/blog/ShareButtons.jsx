import React, { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "../common/SocialIcons";
import { useToast } from "../../context/ToastContext";

const ShareButtons = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast("Failed to copy link", "error");
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#666666] font-medium mr-1 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5 text-[#171717]" />
        Share:
      </span>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="px-2.5 py-1 bg-white border border-[#E5E5E5] rounded text-[#171717] hover:bg-[#F5F5F5] hover:border-[#171717] transition-colors inline-flex items-center gap-1 shadow-xs"
        aria-label="Share on LinkedIn"
      >
        <LinkedinIcon className="w-3 h-3" />
        <span>LinkedIn</span>
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="px-2.5 py-1 bg-white border border-[#E5E5E5] rounded text-[#171717] hover:bg-[#F5F5F5] hover:border-[#171717] transition-colors inline-flex items-center gap-1 shadow-xs"
        aria-label="Share on X"
      >
        <TwitterIcon className="w-3 h-3" />
        <span>X / Twitter</span>
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="px-2.5 py-1 bg-white border border-[#E5E5E5] rounded text-[#171717] hover:bg-[#F5F5F5] hover:border-[#171717] transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-[#171717]" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-3 h-3" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ShareButtons;
