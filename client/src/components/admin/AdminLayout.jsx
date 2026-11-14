import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const navItems = [
  { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Articles", path: "/admin/blogs", icon: FileText },
  { name: "Categories", path: "/admin/categories", icon: FolderTree },
  { name: "Authors", path: "/admin/authors", icon: Users },
  { name: "Tags", path: "/admin/tags", icon: Tags },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      showToast(
        "You were signed out locally, but the server session could not be revoked.",
        "error"
      );
    } finally {
      navigate("/admin/login");
    }
  };

  const isNavItemActive = (item) => {
    if (item.path === "/admin/blogs") {
      return location.pathname === "/admin/blogs" || location.pathname.startsWith("/admin/blogs/");
    }

    return location.pathname === item.path;
  };

  const renderNavigation = (mobile = false) => (
    <nav
      aria-label="Admin navigation"
      id={mobile ? "admin-mobile-navigation" : undefined}
      className={mobile ? "grid grid-cols-2 gap-1 p-3" : "hidden flex-wrap items-center gap-1 py-1 md:flex"}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(item);
        return (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={mobile ? () => setMobileOpen(false) : undefined}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors ${
              mobile ? "border-b-0" : ""
            } ${
              active
                ? "border-[#702F3B] bg-[#F8F5EF] text-[#702F3B]"
                : "border-transparent text-[#716B65] hover:bg-[#F8F5EF] hover:text-[#702F3B]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-site flex min-h-screen flex-col bg-[#F8F5EF]">
      <header className="sticky top-0 z-40 shadow-sm">
        <div className="bg-[#702F3B] text-white">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-3">
              <img
                src="/techpulse-tp.png"
                alt="TechPulse"
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="min-w-0">
                <span className="block font-heading text-lg font-semibold leading-tight">TechPulse</span>
                <span className="block text-[10px] uppercase tracking-[0.16em] text-white/70">Editorial desk</span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-2 text-xs font-medium text-white/80 transition-colors hover:text-white sm:flex"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View publication
              </Link>
              <div className="hidden min-w-0 border-l border-white/20 pl-4 sm:block">
                <p className="max-w-40 truncate text-xs font-semibold">{admin?.name || "Admin User"}</p>
                <p className="max-w-40 truncate text-[10px] text-white/65">{admin?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-1.5 text-xs text-white/75 transition-colors hover:text-white sm:inline-flex"
                title="Log out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Logout</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center border border-white/30 text-white md:hidden"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                aria-controls={mobileOpen ? "admin-mobile-navigation" : undefined}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-[#E5DED3] bg-white">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            {renderNavigation()}
            {mobileOpen && (
              <div className="md:hidden">
                {renderNavigation(true)}
                <div className="flex items-center justify-between border-t border-[#E5DED3] px-3 py-3">
                  <Link to="/" target="_blank" rel="noreferrer" className="text-xs font-medium text-[#702F3B]">
                    View publication
                  </Link>
                  <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 text-xs text-[#716B65]">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
