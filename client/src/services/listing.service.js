import api from "./api";
import { API_ENDPOINTS } from "../constants";

/**
 * Service to manage listings CRUD operations and explore queries.
 */
const listingService = {
  /**
   * Search platform listings with optional filters.
   * @param {object} params - Filter query params (minRent, maxRent, roomType, location, etc.)
   * @returns {Promise<object>} Returns list of matching properties with compatibility scores.
   */
  searchListings: async (params) => {
    const { data } = await api.get(API_ENDPOINTS.LISTINGS, { params });
    return data;
  },

  /**
   * Fetches all properties owned by the active landlord user.
   * @returns {Promise<array>} Array of owned listings.
   */
  getMyListings: async () => {
    const { data } = await api.get(API_ENDPOINTS.MY_LISTINGS);
    return data;
  },

  /**
   * Fetches full specifications for a single listing ID.
   * @param {string} id - The MongoDB listing Object ID.
   * @returns {Promise<object>} Detailed listing specifications.
   */
  getListingById: async (id) => {
    const { data } = await api.get(`${API_ENDPOINTS.LISTINGS}/${id}`);
    return data;
  },

  /**
   * Submits form to create a new property listing.
   * @param {object} form - Listing input values.
   * @returns {Promise<object>} Newly created listing object.
   */
  createListing: async (form) => {
    const { data } = await api.post(API_ENDPOINTS.LISTINGS, form);
    return data;
  },

  /**
   * Submits updates to modify an existing listing.
   * @param {string} id - Listing ID.
   * @param {object} form - Updated form parameters.
   * @returns {Promise<object>} The modified listing object.
   */
  updateListing: async (id, form) => {
    const { data } = await api.put(`${API_ENDPOINTS.LISTINGS}/${id}`, form);
    return data;
  },

  /**
   * Marks listing status as filled in the system database.
   * @param {string} id - Listing ID.
   * @returns {Promise<object>} Returns the updated listing.
   */
  markListingAsFilled: async (id) => {
    const { data } = await api.put(`${API_ENDPOINTS.LISTINGS}/${id}/fill`);
    return data;
  },

  /**
   * Hard deletes a listing.
   * @param {string} id - Listing ID to delete.
   * @returns {Promise<object>} Success confirmation.
   */
  deleteListing: async (id) => {
    const { data } = await api.delete(`${API_ENDPOINTS.LISTINGS}/${id}`);
    return data;
  },
};

export default listingService;
