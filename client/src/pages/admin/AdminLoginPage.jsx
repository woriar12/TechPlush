import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast("Welcome back! Successfully logged in.");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-site admin-login min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#171717] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to website</span>
          </Link>
          <Link to="/" className="block font-heading text-3xl font-semibold text-[#171717]">
            TechPulse
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-[#171717]">Admin Login</h1>
        </div>

        <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8">
          {error && (
            <div id="admin-login-error" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-[#B42333]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-describedby={error ? "admin-login-error" : undefined} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-[#171717]">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                aria-required="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-[#D9D9D9] bg-white px-3 py-2.5 text-sm text-[#171717] placeholder-[#716B65] focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-[#171717]">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  aria-required="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-[#D9D9D9] bg-white px-3 py-2.5 pr-10 text-sm text-[#171717] placeholder-[#716B65] focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#888888] hover:text-[#171717] absolute right-2.5 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-[#702F3B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#56232D] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
