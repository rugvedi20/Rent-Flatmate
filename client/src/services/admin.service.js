import api from "./api";
import { API_ENDPOINTS } from "../constants";

const adminService = {
  getStats: async () => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_STATS);
    return data;
  },

  getUsers: async (search = "") => {
    const { data } = await api.get(`${API_ENDPOINTS.ADMIN_USERS}?search=${encodeURIComponent(search)}`);
    return data;
  },

  getListings: async (search = "") => {
    const { data } = await api.get(`${API_ENDPOINTS.ADMIN_LISTINGS}?search=${encodeURIComponent(search)}`);
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`${API_ENDPOINTS.ADMIN_USERS}/${id}`);
    return data;
  },

  deleteListing: async (id) => {
    const { data } = await api.delete(`${API_ENDPOINTS.ADMIN_LISTINGS}/${id}`);
    return data;
  },
};

export default adminService;
