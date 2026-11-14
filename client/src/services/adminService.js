import api from "../api/client";

export const getDashboardStats = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};
