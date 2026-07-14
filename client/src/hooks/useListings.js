import { useState, useCallback } from "react";
import listingService from "../services/listing.service";
import savedService from "../services/saved.service";
import interestService from "../services/interest.service";

export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [ranked, setRanked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");

  // Search filter states
  const [searchLoc, setSearchLoc] = useState("");
  const [searchMin, setSearchMin] = useState("");
  const [searchMax, setSearchMax] = useState("");
  const [searchRoomType, setSearchRoomType] = useState("");
  const [searchFurnishing, setSearchFurnishing] = useState("");

  const [savedListings, setSavedListings] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);

  const loadSentInterests = useCallback(async () => {
    try {
      const data = await interestService.getSentInterests();
      setSentInterests(data);
    } catch {
      // ignore
    }
  }, []);

  const loadSavedListings = useCallback(async () => {
    try {
      const data = await savedService.getSavedListings();
      setSavedListings(data);
    } catch {
      // ignore
    }
  }, []);

  const toggleSave = useCallback(async (listingId) => {
    try {
      const data = await savedService.toggleSavedListing(listingId);
      setMessage(data.message);
      await loadSavedListings();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to update bookmark.");
      setTimeout(() => setMessage(""), 3000);
    }
  }, [loadSavedListings]);

  const loadListings = useCallback(async (targetPage = 1, currentFilters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: targetPage,
        limit: 6,
        location: currentFilters.location !== undefined ? currentFilters.location : (searchLoc || undefined),
        minRent: currentFilters.minRent !== undefined ? currentFilters.minRent : (searchMin || undefined),
        maxRent: currentFilters.maxRent !== undefined ? currentFilters.maxRent : (searchMax || undefined),
        roomType: currentFilters.roomType !== undefined ? currentFilters.roomType : (searchRoomType || undefined),
        furnishing: currentFilters.furnishing !== undefined ? currentFilters.furnishing : (searchFurnishing || undefined),
      };

      const data = await listingService.searchListings(params);
      setRanked(data.ranked);
      setListings(data.listings);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      console.error("Failed to load listings:", err);
      setMessage("Failed to retrieve listings. If your session has expired, please sign out and sign in again.");
    } finally {
      setLoading(false);
    }
  }, [searchLoc, searchMin, searchMax, searchRoomType, searchFurnishing]);

  const expressInterest = useCallback(async (listingId) => {
    try {
      await interestService.expressInterest(listingId);
      setMessage("Interest expressed successfully! Notification sent to owner.");
      await loadSentInterests();
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to express interest");
      setTimeout(() => setMessage(""), 4000);
    }
  }, [loadSentInterests]);

  const handleReset = useCallback(() => {
    setSearchLoc("");
    setSearchMin("");
    setSearchMax("");
    setSearchRoomType("");
    setSearchFurnishing("");
    loadListings(1, {
      location: "",
      minRent: "",
      maxRent: "",
      roomType: "",
      furnishing: "",
    });
  }, [loadListings]);

  return {
    listings,
    ranked,
    loading,
    page,
    totalPages,
    message,
    setMessage,
    searchLoc,
    setSearchLoc,
    searchMin,
    setSearchMin,
    searchMax,
    setSearchMax,
    searchRoomType,
    setSearchRoomType,
    searchFurnishing,
    setSearchFurnishing,
    savedListings,
    sentInterests,
    loadSentInterests,
    loadSavedListings,
    toggleSave,
    loadListings,
    expressInterest,
    handleReset,
  };
};

export default useListings;
