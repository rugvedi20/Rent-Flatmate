import { useState, useEffect, useCallback } from "react";
import profileService from "../services/profile.service";
import reviewService from "../services/review.service";

export const useProfile = (userId) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  // Edit form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formOccupation, setFormOccupation] = useState("");
  const [formCompanyOrCollege, setFormCompanyOrCollege] = useState("");
  const [formLanguages, setFormLanguages] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  const [formPreferredLocation, setFormPreferredLocation] = useState("");
  const [formBudgetMin, setFormBudgetMin] = useState("");
  const [formBudgetMax, setFormBudgetMax] = useState("");
  const [formMoveInDate, setFormMoveInDate] = useState("");
  const [formPreferredRoomType, setFormPreferredRoomType] = useState("single");
  const [formPreferredFurnishing, setFormPreferredFurnishing] = useState("unfurnished");
  const [formParkingRequired, setFormParkingRequired] = useState(false);
  const [formPetsAllowed, setFormPetsAllowed] = useState(false);
  const [formSmokingAllowed, setFormSmokingAllowed] = useState(false);
  const [formGenderPreference, setFormGenderPreference] = useState("any");
  const [formLocationCoords, setFormLocationCoords] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await profileService.getProfileByUserId(userId);
      setProfileData(data);
      setReviews(data.reviews || []);
      setReviewsStats(data.reviewsStats || { averageRating: 0, totalReviews: 0 });
      
      // Initialize form fields
      setFormName(data.user?.name || "");
      setFormPhone(data.profile?.phone || "");
      setFormBio(data.profile?.bio || "");
      setFormOccupation(data.profile?.occupation || "");
      setFormCompanyOrCollege(data.profile?.companyOrCollege || "");
      setFormLanguages(data.profile?.languages || "");
      setFormAvatarUrl(data.profile?.avatarUrl || "");
      setFormCoverImageUrl(data.profile?.coverImageUrl || "");
      setFormPreferredLocation(data.profile?.preferredLocation || "");
      setFormBudgetMin(data.profile?.budgetMin || "");
      setFormBudgetMax(data.profile?.budgetMax || "");
      setFormMoveInDate(data.profile?.moveInDate?.slice(0, 10) || "");
      setFormPreferredRoomType(data.profile?.preferredRoomType || "single");
      setFormPreferredFurnishing(data.profile?.preferredFurnishing || "unfurnished");
      setFormParkingRequired(!!data.profile?.parkingRequired);
      setFormPetsAllowed(!!data.profile?.petsAllowed);
      setFormSmokingAllowed(!!data.profile?.smokingAllowed);
      setFormGenderPreference(data.profile?.genderPreference || "any");
      setFormLocationCoords(data.profile?.locationCoords || { type: "Point", coordinates: [73.8567, 18.5204] });

      setError(null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Unable to retrieve user profile details.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [userId, loadProfile]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    try {
      setMessage("Saving profile...");
      const payload = {
        name: formName,
        phone: formPhone,
        bio: formBio,
        occupation: formOccupation,
        companyOrCollege: formCompanyOrCollege,
        languages: formLanguages,
        avatarUrl: formAvatarUrl,
        coverImageUrl: formCoverImageUrl,
      };

      if (profileData?.user?.role === "tenant") {
        payload.preferredLocation = formPreferredLocation;
        payload.budgetMin = Number(formBudgetMin) || 0;
        payload.budgetMax = Number(formBudgetMax) || 0;
        payload.moveInDate = formMoveInDate || undefined;
        payload.preferredRoomType = formPreferredRoomType;
        payload.preferredFurnishing = formPreferredFurnishing;
        payload.parkingRequired = formParkingRequired;
        payload.petsAllowed = formPetsAllowed;
        payload.smokingAllowed = formSmokingAllowed;
        payload.genderPreference = formGenderPreference;
        if (formLocationCoords) {
          payload.locationCoords = formLocationCoords;
        }
      }

      await profileService.upsertProfile(payload);
      setMessage("Profile saved successfully!");
      setIsEditing(false);
      await loadProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile. Check details and try again.");
      setTimeout(() => setMessage(""), 4000);
    }
  }, [
    formName,
    formPhone,
    formBio,
    formOccupation,
    formCompanyOrCollege,
    formLanguages,
    formAvatarUrl,
    formCoverImageUrl,
    formPreferredLocation,
    formBudgetMin,
    formBudgetMax,
    formMoveInDate,
    formPreferredRoomType,
    formPreferredFurnishing,
    formParkingRequired,
    formPetsAllowed,
    formSmokingAllowed,
    formGenderPreference,
    formLocationCoords,
    profileData,
    loadProfile,
  ]);

  const handleReviewSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setReviewSubmitting(true);
    try {
      const data = await reviewService.submitReview({
        ownerId: userId,
        rating: newRating,
        reviewText: newReviewText.trim(),
      });
      setReviews((prev) => [data, ...prev]);
      setReviewsStats((prev) => {
        const total = prev.totalReviews + 1;
        const avg = ((prev.averageRating * prev.totalReviews + newRating) / total).toFixed(1);
        return { averageRating: parseFloat(avg), totalReviews: total };
      });
      setNewReviewText("");
      setNewRating(5);
      setReviewMessage("Review submitted successfully! Thank you.");
      setTimeout(() => setReviewMessage(""), 4000);
    } catch {
      setReviewMessage("Failed to submit review. Limit one review per landlord.");
      setTimeout(() => setReviewMessage(""), 4000);
    } finally {
      setReviewSubmitting(false);
    }
  }, [userId, newRating, newReviewText]);

  return {
    profileData,
    loading,
    error,
    isEditing,
    setIsEditing,
    message,
    setMessage,
    formName,
    setFormName,
    formPhone,
    setFormPhone,
    formBio,
    setFormBio,
    formOccupation,
    setFormOccupation,
    formCompanyOrCollege,
    setFormCompanyOrCollege,
    formLanguages,
    setFormLanguages,
    formAvatarUrl,
    setFormAvatarUrl,
    formCoverImageUrl,
    setFormCoverImageUrl,
    formPreferredLocation,
    setFormPreferredLocation,
    formBudgetMin,
    setFormBudgetMin,
    formBudgetMax,
    setFormBudgetMax,
    formMoveInDate,
    setFormMoveInDate,
    formPreferredRoomType,
    setFormPreferredRoomType,
    formPreferredFurnishing,
    setFormPreferredFurnishing,
    formParkingRequired,
    setFormParkingRequired,
    formPetsAllowed,
    setFormPetsAllowed,
    formSmokingAllowed,
    setFormSmokingAllowed,
    formGenderPreference,
    setFormGenderPreference,
    formLocationCoords,
    setFormLocationCoords,
    reviews,
    reviewsStats,
    newRating,
    setNewRating,
    newReviewText,
    setNewReviewText,
    reviewMessage,
    reviewSubmitting,
    handleSave,
    handleReviewSubmit,
  };
};

export default useProfile;
