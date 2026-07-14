export const ROLES = {
  TENANT: "tenant",
  OWNER: "owner",
  ADMIN: "admin",
};

export const ROOM_TYPES = ["single", "shared", "1bhk", "2bhk", "other"];

export const FURNISHING_STATUS = ["furnished", "semi-furnished", "unfurnished"];

export const PUNE_DEFAULT_COORDS = [73.8567, 18.5204];

export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LISTINGS: "/listings",
  MY_LISTINGS: "/listings/my",
  INTEREST: "/interest",
  RECEIVED_INTERESTS: "/interest/received",
  SENT_INTERESTS: "/interest/sent",
  CONVERSATIONS: "/messages/conversations",
  CONVERSATION_MESSAGES: (id) => `/messages/conversation/${id}`,
  MESSAGES: "/messages",
  SAVED: "/saved",
  TOGGLE_SAVED: "/saved/toggle",
  REVIEWS: "/reviews",
  PROFILE: "/profile",
  ADMIN_STATS: "/admin/stats",
  ADMIN_USERS: "/admin/users",
  ADMIN_LISTINGS: "/admin/listings",
};
