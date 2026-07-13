import { useEffect, useState } from "react";
import api from "../services/api";

function ScoreBadge({ score }) {
  const cls = score >= 80 ? "badge-high" : score >= 50 ? "badge-mid" : "badge-low";
  return <span className={`badge ${cls}`}>{score}% match</span>;
}

export default function TenantDashboard() {
  const [profile, setProfile] = useState({ preferredLocation: "", budgetMin: "", budgetMax: "", moveInDate: "" });
  const [listings, setListings] = useState([]);
  const [ranked, setRanked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sentInterests, setSentInterests] = useState([]);

  const loadSentInterests = async () => {
    const { data } = await api.get("/interest/sent");
    setSentInterests(data);
  };

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/tenants/profile");
      setProfile({
        preferredLocation: data.preferredLocation,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        moveInDate: data.moveInDate?.slice(0, 10),
      });
    } catch {
      // no profile yet — fine
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/listings");
      setRanked(data.ranked);
      setListings(data.listings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadListings();
    loadSentInterests();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    await api.post("/tenants/profile", profile);
    setMessage("Profile saved. Refreshing compatibility scores...");
    await loadListings();
    setMessage("Done — listings ranked by compatibility.");
  };

  const expressInterest = async (listingId) => {
    try {
      await api.post("/interest", { listingId });
      setMessage("Interest sent!");
      await loadSentInterests();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send interest");
    }
  };

  return (
    <div className="container">
      <h2>Your Preferences</h2>
      <form onSubmit={saveProfile}>
        <input
          placeholder="Preferred location (e.g. Baner)"
          value={profile.preferredLocation}
          onChange={(e) => setProfile({ ...profile, preferredLocation: e.target.value })}
          required
        />
        <input
          type="number" placeholder="Min budget"
          value={profile.budgetMin}
          onChange={(e) => setProfile({ ...profile, budgetMin: e.target.value })}
          required
        />
        <input
          type="number" placeholder="Max budget"
          value={profile.budgetMax}
          onChange={(e) => setProfile({ ...profile, budgetMax: e.target.value })}
          required
        />
        <input
          type="date"
          value={profile.moveInDate}
          onChange={(e) => setProfile({ ...profile, moveInDate: e.target.value })}
          required
        />
        <button type="submit">Save Preferences</button>
      </form>

      {message && <p><em>{message}</em></p>}

      <h2>My Interest Requests</h2>
      {sentInterests.length === 0 && <p>No requests sent yet.</p>}
      {sentInterests.map((i) => (
        <div className="card" key={i._id}>
          <p>{i.listingId?.title} — {i.listingId?.location} · ₹{i.listingId?.rent}</p>
          <p>Status: {i.status}</p>
          {i.status === "accepted" && (
            <a href={`/chat/${i.listingId?._id}?receiverId=${i.listingId?.ownerId}`}>Open Chat</a>
          )}
        </div>
      ))}

      <h2>Listings {ranked && "(ranked by compatibility)"}</h2>
      {loading && <p>Loading...</p>}
      {listings.map((item) => {
        const listing = ranked ? item.listing : item;
        const compatibility = ranked ? item.compatibility : null;
        return (
          <div className="card" key={listing._id}>
            <h3>{listing.title} — {listing.location}</h3>
            <p>₹{listing.rent}/mo · Available from {new Date(listing.availableFrom).toLocaleDateString()}</p>
            <p>{listing.roomType} · {listing.furnishing}</p>
            {compatibility && (
              <p>
                <ScoreBadge score={compatibility.score} /> ({compatibility.generatedBy})
                <br />
                <small>{compatibility.explanation}</small>
              </p>
            )}
            <button onClick={() => expressInterest(listing._id)}>Express Interest</button>
          </div>
        );
      })}
    </div>
  );
}
