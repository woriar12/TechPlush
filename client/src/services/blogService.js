import api from "../api/client";

export const getPublishedBlogs = async (params = {}) => {
  const response = await api.get("/blogs", { params });
  return response.data;
};

export const getBlogBySlug = async (slug) => {
  const response = await api.get(`/blogs/${slug}`);
  return response.data;
};

export const getAdminBlogs = async (params = {}) => {
  const response = await api.get("/blogs/admin/all", { params });
  return response.data;
};

export const getBlogById = async (id) => {
  const response = await api.get(`/blogs/admin/${id}`);
  return response.data;
};

export const createBlog = async (formData) => {
  const response = await api.post("/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateBlog = async (id, formData) => {
  const response = await api.put(`/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`/blogs/${id}`);
  return response.data;
};

export const togglePublishBlog = async (id, status = null) => {
  const response = await api.patch(`/blogs/${id}/publish`, { status });
  return response.data;
};

export const uploadEditorImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/blogs/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
