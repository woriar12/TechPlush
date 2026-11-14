import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const AdminHeader = ({ title = "Dashboard" }) => {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#E5DED3] pb-4 sm:pb-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#702F3B]">
          Editorial workspace
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-[#292522] sm:text-3xl">
          {title}
        </h1>
      </div>

      <Link
        to="/admin/blogs/create"
        className="inline-flex shrink-0 items-center gap-1.5 bg-[#702F3B] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#56232D] sm:px-4"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        <span>New Blog</span>
      </Link>
    </header>
  );
};

export default AdminHeader;
