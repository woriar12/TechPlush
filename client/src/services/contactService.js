import api from "../api/client";

export const submitContactMessage = async (message) => {
  const response = await api.post("/contact", message);
  return response.data;
};
