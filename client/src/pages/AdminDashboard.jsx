import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);

  const loadAll = async () => {
    const [s, u, l] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/listings"),
    ]);
    setStats(s.data);
    setUsers(u.data);
    setListings(l.data);
  };

  useEffect(() => { loadAll(); }, []);

  const deleteUser = async (id) => { await api.delete(`/admin/users/${id}`); loadAll(); };
  const deleteListing = async (id) => { await api.delete(`/admin/listings/${id}`); loadAll(); };

  return (
    <div className="container">
      <h2>Platform Overview</h2>
      {stats && (
        <div className="card">
          <p>Total Users: {stats.totalUsers} (Owners: {stats.totalOwners}, Tenants: {stats.totalTenants})</p>
          <p>Listings: {stats.totalListings} ({stats.activeListings} active)</p>
          <p>Interests: {stats.totalInterests} ({stats.acceptedInterests} accepted)</p>
        </div>
      )}

      <h2>Users</h2>
      {users.map((u) => (
        <div className="card" key={u._id}>
          {u.name} — {u.email} ({u.role})
          <button style={{ marginLeft: 10 }} onClick={() => deleteUser(u._id)}>Delete</button>
        </div>
      ))}

      <h2>Listings</h2>
      {listings.map((l) => (
        <div className="card" key={l._id}>
          {l.title} — {l.location} · ₹{l.rent} ({l.status})
          <button style={{ marginLeft: 10 }} onClick={() => deleteListing(l._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
