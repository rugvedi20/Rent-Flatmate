import api from "./api";
import { API_ENDPOINTS } from "../constants";

const chatService = {
  getConversations: async () => {
    const { data } = await api.get(API_ENDPOINTS.CONVERSATIONS);
    return data;
  },

  getConversationMessages: async (conversationId, limit = 50) => {
    const { data } = await api.get(`${API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId)}?limit=${limit}`);
    return data;
  },

  getMessagesByListing: async (listingId, receiverId) => {
    const { data } = await api.get(`${API_ENDPOINTS.MESSAGES}/${listingId}?receiverId=${receiverId}`);
    return data;
  },
};

export default chatService;
