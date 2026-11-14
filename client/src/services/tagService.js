import api from "../api/client";

export const getTags = async () => {
  const response = await api.get("/tags");
  return response.data;
};

export const getAdminTags = async () => {
  const response = await api.get("/tags/admin/all");
  return response.data;
};

export const createTag = async (data) => {
  const response = await api.post("/tags", data);
  return response.data;
};

export const updateTag = async (id, data) => {
  const response = await api.put(`/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id) => {
  const response = await api.delete(`/tags/${id}`);
  return response.data;
};
