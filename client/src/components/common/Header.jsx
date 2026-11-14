import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { getCategories } from "../../services/categoryService";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    getCategories()
      .then((response) => {
        if (response.success) setCategories(response.data || []);
      })
      .catch((error) => console.error("Failed to load navigation categories:", error));
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    if (location.hash) {
      requestAnimationFrame(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location.pathname, location.hash]);

  const findCategory = (matches) => categories.find((category) => (
    matches.some((term) => `${category.name} ${category.slug}`.toLowerCase().includes(term))
  ));
  const categoryLinks = [
    { name: "AI & ML", category: findCategory(["artificial intelligence", "machine learning", "ai-"]) },
    { name: "Development", category: findCategory(["development", "software"]) },
    { name: "Cybersecurity", category: findCategory(["cybersecurity", "security"]) },
    { name: "Cloud", category: findCategory(["cloud"]) },
  ].filter((link) => link.category);
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Technology", path: "/blogs" },
    ...categoryLinks.map(({ name, category }) => ({
      name,
      path: `/category/${category.slug}`,
    })),
  ];

  const isActive = (path) => (
    path === "/"
      ? location.pathname === "/"
      : path === "/blogs"
        ? location.pathname === "/blogs"
        : location.pathname === path
  );

  return (
    <header className="magazine-header">
      <div className="magazine-container magazine-header__inner">
        <Link to="/" className="magazine-logo" aria-label="TechPulse home">
          <img
            src="/techpulse-tp.png"
            alt="TechPulse"
            className="h-14 w-[120px] object-contain"
          />
        </Link>

        <nav className="magazine-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={isActive(link.path) ? "page" : undefined}
              className={isActive(link.path) ? "is-active" : ""}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="magazine-header__actions">
          <Link to="/search" aria-label="Search articles" className="magazine-search-link">
            <Search aria-hidden="true" size={18} />
            <span>Search</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="magazine-menu-toggle"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? "mobile-navigation" : undefined}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav id="mobile-navigation" className="magazine-mobile-nav" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={isActive(link.path) ? "page" : undefined}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/search">Search articles</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
