import api from "../api/client";

export const getAuthors = async () => {
  const response = await api.get("/authors");
  return response.data;
};

export const getAdminAuthors = async () => {
  const response = await api.get("/authors/admin/all");
  return response.data;
};

export const createAuthor = async (formData) => {
  const response = await api.post("/authors", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateAuthor = async (id, formData) => {
  const response = await api.put(`/authors/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteAuthor = async (id) => {
  const response = await api.delete(`/authors/${id}`);
  return response.data;
};
