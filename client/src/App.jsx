import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import HomePage from "./pages/public/HomePage";
import BlogListingPage from "./pages/public/BlogListingPage";
import BlogDetailPage from "./pages/public/BlogDetailPage";
import CategoryPage from "./pages/public/CategoryPage";
import SearchPage from "./pages/public/SearchPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminBlogListPage from "./pages/admin/AdminBlogListPage";
import AdminBlogEditorPage from "./pages/admin/AdminBlogEditorPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import AdminTagPage from "./pages/admin/AdminTagPage";
import AdminAuthorPage from "./pages/admin/AdminAuthorPage";

import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

const PublicLayout = () => {
  return (
    <div className="editorial-site min-h-screen flex w-full flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <h1 className="text-6xl font-black text-[#171717] mb-2">404</h1>
      <h2 className="text-xl font-bold text-[#171717] mb-4">Page Not Found</h2>
      <p className="text-sm text-[#666666] mb-6">
        The requested technical publication, category, or page could not be located.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 rounded bg-[#702F3B] text-white text-xs font-bold hover:bg-[#56232D] transition-all"
      >
        Return to Home
      </a>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/blogs" element={<BlogListingPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin CMS Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="blogs" element={<AdminBlogListPage />} />
              <Route path="blogs/create" element={<AdminBlogEditorPage />} />
              <Route path="blogs/edit/:id" element={<AdminBlogEditorPage />} />
              <Route path="categories" element={<AdminCategoryPage />} />
              <Route path="tags" element={<AdminTagPage />} />
              <Route path="authors" element={<AdminAuthorPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
