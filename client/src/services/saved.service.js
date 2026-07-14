import api from "./api";
import { API_ENDPOINTS } from "../constants";

const savedService = {
  toggleSavedListing: async (listingId) => {
    const { data } = await api.post(API_ENDPOINTS.TOGGLE_SAVED, { listingId });
    return data;
  },

  getSavedListings: async () => {
    const { data } = await api.get(API_ENDPOINTS.SAVED);
    return data;
  },
};

export default savedService;
