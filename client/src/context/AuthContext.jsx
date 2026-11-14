import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAdmin as apiLogin, logoutAdmin as apiLogout, getCurrentAdmin } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("techblog_admin_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("techblog_admin_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem("techblog_admin_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await getCurrentAdmin();
        if (res.success && res.data) {
          setAdmin(res.data);
          localStorage.setItem("techblog_admin_user", JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn("Session expired or invalid token:", err.message);
        localStorage.removeItem("techblog_admin_token");
        localStorage.removeItem("techblog_admin_user");
        setToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (res.success && res.data?.token) {
      setToken(res.data.token);
      setAdmin(res.data.admin);
      localStorage.setItem("techblog_admin_token", res.data.token);
      localStorage.setItem("techblog_admin_user", JSON.stringify(res.data.admin));
      return res;
    }
    throw new Error(res.message || "Login failed");
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      throw new Error("Server session revocation failed.");
    } finally {
      localStorage.removeItem("techblog_admin_token");
      localStorage.removeItem("techblog_admin_user");
      setToken(null);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
