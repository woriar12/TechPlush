import React from "react";
import { User, Globe } from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "../common/SocialIcons";

const AuthorCard = ({ author }) => {
  if (!author) return null;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-md p-6 my-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
      {/* Avatar */}
      {author.profileImage?.url ? (
        <img
          src={author.profileImage.url}
          alt={author.name}
          className="w-16 h-16 rounded-full object-cover border border-[#E5E5E5] flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[#F5F5F5] text-[#171717] flex items-center justify-center font-bold text-xl flex-shrink-0 border border-[#E5E5E5]">
          {author.name ? author.name.charAt(0) : <User className="w-6 h-6" />}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
          <div>
            <h4 className="text-base font-bold text-[#171717]">{author.name}</h4>
            <p className="text-xs text-[#666666] font-medium">{author.designation || "Editorial Contributor"}</p>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center sm:justify-end gap-2 pt-1">
            {author.socialLinks?.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-[#666666] hover:text-[#171717] p-1.5 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {author.socialLinks?.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="text-[#666666] hover:text-[#171717] p-1.5 transition-colors"
                aria-label="Twitter Profile"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
            {author.socialLinks?.website && (
              <a
                href={author.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#666666] hover:text-[#171717] p-1.5 transition-colors"
                aria-label="Personal Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {author.bio && (
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mt-2 pt-2 border-t border-[#E5E5E5]">
            {author.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;
