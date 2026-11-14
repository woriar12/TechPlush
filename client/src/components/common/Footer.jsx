import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "./SocialIcons";
import { getCategories } from "../../services/categoryService";

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((response) => {
        if (response.success) setCategories(response.data || []);
      })
      .catch((error) => console.error("Failed to load footer categories:", error));
  }, []);

  return (
    <footer className="magazine-footer mt-12 border-t border-[#E5E5E5] bg-[#F5F5F5]">
      <div className="magazine-container py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2">
            <Link to="/" aria-label="TechPulse home" className="inline-block">
              <img
                src="/techpulse-tp.png"
                alt="TechPulse"
                className="h-14 w-14 object-contain"
              />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-[#666666]">
              Thoughtful reporting and practical ideas for people building with technology.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#666666] hover:text-[#171717]" aria-label="GitHub">
                <GithubIcon size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-[#666666] hover:text-[#171717]" aria-label="LinkedIn">
                <LinkedinIcon size={20} />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="text-[#666666] hover:text-[#171717]" aria-label="X">
                <TwitterIcon size={20} />
              </a>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#171717]">
              Topics
            </h2>
            <ul className="space-y-2 text-sm text-[#666666]">
              {categories.slice(0, 6).map((category) => (
                <li key={category._id}>
                  <Link to={`/category/${category.slug}`} className="hover:text-[#171717]">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#171717]">
              Publication
            </h2>
            <ul className="space-y-2 text-sm text-[#666666]">
              <li><Link to="/" className="hover:text-[#171717]">Home</Link></li>
              <li><Link to="/blogs" className="hover:text-[#171717]">All blogs</Link></li>
              <li><Link to="/about" className="hover:text-[#171717]">About TechPulse</Link></li>
              <li><Link to="/contact" className="hover:text-[#171717]">Contact</Link></li>
              <li><Link to="/admin/login" className="hover:text-[#171717]">Admin Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E5E5E5] pt-5 text-xs text-[#666666]">
          © {new Date().getFullYear()} TechPulse. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
