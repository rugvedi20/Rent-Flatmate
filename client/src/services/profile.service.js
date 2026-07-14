import api from "./api";
import { API_ENDPOINTS } from "../constants";

const profileService = {
  getProfileByUserId: async (userId) => {
    const { data } = await api.get(`${API_ENDPOINTS.PROFILE}/${userId}`);
    return data;
  },

  upsertProfile: async (payload) => {
    const { data } = await api.post(API_ENDPOINTS.PROFILE, payload);
    return data;
  },
};

export default profileService;
