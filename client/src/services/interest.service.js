import api from "./api";
import { API_ENDPOINTS } from "../constants";

const interestService = {
  expressInterest: async (listingId) => {
    const { data } = await api.post(API_ENDPOINTS.INTEREST, { listingId });
    return data;
  },

  updateInterestStatus: async (id, status) => {
    const { data } = await api.put(`${API_ENDPOINTS.INTEREST}/${id}`, { status });
    return data;
  },

  getReceivedInterests: async () => {
    const { data } = await api.get(API_ENDPOINTS.RECEIVED_INTERESTS);
    return data;
  },

  getSentInterests: async () => {
    const { data } = await api.get(API_ENDPOINTS.SENT_INTERESTS);
    return data;
  },
};

export default interestService;
