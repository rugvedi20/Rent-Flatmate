export const formatDate = (val) => {
  if (!val) return "Immediate";
  const date = new Date(val);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatTime = (val) => {
  if (!val) return "";
  const date = new Date(val);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatCurrency = (val) => {
  if (val === undefined || val === null) return "₹0";
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

export const formatDistance = (dist) => {
  if (dist === undefined || dist === null) return "";
  return `${Number(dist).toFixed(1)} km`;
};

export const storage = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token) => localStorage.setItem("token", token),
  removeToken: () => localStorage.removeItem("token"),
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem("user", JSON.stringify(user)),
  removeUser: () => localStorage.removeItem("user"),
  clear: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
