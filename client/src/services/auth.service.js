import api from "./api";
import { API_ENDPOINTS } from "../constants";

/**
 * Authentication service handling login and registration endpoints.
 */
const authService = {
  /**
   * Performs user login request.
   * @param {string} email - User email address.
   * @param {string} password - User password.
   * @returns {Promise<object>} Returns the API response payload with JWT token and user info.
   */
  login: async (email, password) => {
    const { data } = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return data;
  },

  /**
   * Performs user registration request.
   * @param {object} payload - Registration data containing name, email, password, and role.
   * @returns {Promise<object>} Returns the API response payload with user profile details and token.
   */
  register: async (payload) => {
    const { data } = await api.post(API_ENDPOINTS.REGISTER, payload);
    return data;
  },
};

export default authService;
