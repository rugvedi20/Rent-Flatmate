import { useEffect, useState } from "react";
import api from "../services/api";

export default function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [form, setForm] = useState({
    title: "", location: "", rent: "", availableFrom: "",
    roomType: "single", furnishing: "unfurnished", description: "",
  });
  const [message, setMessage] = useState("");

  const loadListings = async () => {
    const { data } = await api.get("/listings/my");
    setListings(data);
  };

  const loadInterests = async () => {
    const { data } = await api.get("/interest/received");
    setInterests(data);
  };

  useEffect(() => {
    loadListings();
    loadInterests();
  }, []);

  const createListing = async (e) => {
    e.preventDefault();
    await api.post("/listings", form);
    setMessage("Listing created!");
    setForm({ title: "", location: "", rent: "", availableFrom: "", roomType: "single", furnishing: "unfurnished", description: "" });
    loadListings();
  };

  const markFilled = async (id) => {
    await api.put(`/listings/${id}/fill`);
    loadListings();
  };

  const respond = async (id, status) => {
    await api.put(`/interest/${id}`, { status });
    loadInterests();
  };

  return (
    <div className="container">
      <h2>Create a Listing</h2>
      <form onSubmit={createListing}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <input type="number" placeholder="Rent" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required />
        <input type="date" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} required />
        <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
          <option value="single">Single</option>
          <option value="shared">Shared</option>
          <option value="1bhk">1BHK</option>
          <option value="2bhk">2BHK</option>
          <option value="other">Other</option>
        </select>
        <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
          <option value="furnished">Furnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Create Listing</button>
      </form>
      {message && <p><em>{message}</em></p>}

      <h2>My Listings</h2>
      {listings.map((l) => (
        <div className="card" key={l._id}>
          <h3>{l.title} — {l.location} ({l.status})</h3>
          <p>₹{l.rent}/mo</p>
          {l.status === "available" && <button onClick={() => markFilled(l._id)}>Mark Filled</button>}
        </div>
      ))}

      <h2>Interest Requests</h2>
      {interests.map((i) => (
        <div className="card" key={i._id}>
          <p><strong>{i.tenantId?.name}</strong> ({i.tenantId?.email}) is interested in <strong>{i.listingId?.title}</strong></p>
          <p>Status: {i.status} {i.compatibilityScoreAtRequest != null && `· Compatibility: ${i.compatibilityScoreAtRequest}%`}</p>
          {i.status === "pending" && (
            <>
              <button onClick={() => respond(i._id, "accepted")}>Accept</button>{" "}
              <button onClick={() => respond(i._id, "rejected")}>Reject</button>
            </>
          )}
          {i.status === "accepted" && (
            <a href={`/chat/${i.listingId?._id}?receiverId=${i.tenantId?._id}`}>Open Chat</a>
          )}
        </div>
      ))}
    </div>
  );
}
