import api from "./api";
import { API_ENDPOINTS } from "../constants";

const reviewService = {
  submitReview: async (payload) => {
    const { data } = await api.post(API_ENDPOINTS.REVIEWS, payload);
    return data;
  },

  getReviewsForOwner: async (ownerId) => {
    const { data } = await api.get(`${API_ENDPOINTS.REVIEWS}/owner/${ownerId}`);
    return data;
  },
};

export default reviewService;
