import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileDetailsView from "../components/profile/ProfileDetailsView";
import ProfileReviews from "../components/profile/ProfileReviews";
import ProfileEditForm from "../components/profile/ProfileEditForm";

export default function ProfilePage({ userId: propUserId, isDashboard = false }) {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const userId = propUserId || routeUserId || (currentUser ? currentUser._id : null);
  const isOwnProfile = currentUser && String(userId) === String(currentUser._id);

  const {
    profileData,
    loading,
    error,
    isEditing,
    setIsEditing,
    message,
    formName,
    setFormName,
    formPhone,
    setFormPhone,
    formOccupation,
    setFormOccupation,
    formCompanyOrCollege,
    setFormCompanyOrCollege,
    formLanguages,
    setFormLanguages,
    formBio,
    setFormBio,
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
  } = useProfile(userId);

  const getProfileCompletion = () => {
    if (!profileData?.profile) return 0;
    const p = profileData.profile;
    let completed = 0;
    let total = 7; // base fields

    if (profileData.user?.name) completed += 1;
    if (p.bio) completed += 1;
    if (p.occupation) completed += 1;
    if (p.companyOrCollege) completed += 1;
    if (p.languages) completed += 1;
    if (p.phone) completed += 1;
    if (p.avatarUrl) completed += 1;
    
    if (profileData.user?.role === "tenant") {
      total += 4; // preference fields
      if (p.preferredLocation) completed += 1;
      if (p.budgetMax) completed += 1;
      if (p.moveInDate) completed += 1;
      if (p.preferredRoomType) completed += 1;
    }

    return Math.round((completed / total) * 100);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-container py-12">
        <div style={{ height: "240px", borderRadius: "16px" }} className="skeleton-pulse" />
        <div className="profile-grid mt-6">
          <div style={{ height: "400px", borderRadius: "16px" }} className="skeleton-pulse" />
          <div style={{ height: "500px", borderRadius: "16px" }} className="skeleton-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="profile-container py-24 text-center">
        <span style={{ fontSize: "48px" }}>👤</span>
        <h2 style={{ fontSize: "22px", fontWeight: "750", marginTop: "16px" }}>Profile Unavailable</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>{error || "User could not be found."}</p>
        <button onClick={() => navigate(-1)} className="btn mt-4">Go Back</button>
      </div>
    );
  }

  const { user, profile } = profileData;
  const completion = getProfileCompletion();

  return (
    <div className="profile-container">
      {/* Back button link if not inside dashboard tabs */}
      {!isDashboard && (
        <button 
          onClick={() => navigate(-1)}
          className="btn"
          style={{ background: "transparent", color: "var(--text-main)", border: "none", boxShadow: "none", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", cursor: "pointer", alignSelf: "flex-start", padding: 0 }}
        >
          &larr; Back
        </button>
      )}

      {message && (
        <div style={{ padding: "12px 20px", background: "var(--primary-light)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "12px", fontWeight: "600", fontSize: "14px" }}>
          💡 {message}
        </div>
      )}

      {/* Profile Card Header */}
      <ProfileHeader
        user={user}
        profile={profile}
        reviewsStats={reviewsStats}
        completion={completion}
        isOwnProfile={isOwnProfile}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        getInitials={getInitials}
      />

      {/* Profile Main Body Grid */}
      {!isEditing ? (
        <div className="profile-grid">
          {/* Left Column: Sidebar details */}
          <ProfileSidebar user={user} profile={profile} />

          {/* Right Column: Bio, Work, Preferences and Reviews */}
          <div className="profile-content-area">
            <ProfileDetailsView user={user} profile={profile} />

            {/* Owner Reviews Section */}
            <ProfileReviews
              user={user}
              currentUser={currentUser}
              isOwnProfile={isOwnProfile}
              reviews={reviews}
              reviewsStats={reviewsStats}
              newRating={newRating}
              setNewRating={setNewRating}
              newReviewText={newReviewText}
              setNewReviewText={setNewReviewText}
              reviewMessage={reviewMessage}
              reviewSubmitting={reviewSubmitting}
              handleReviewSubmit={handleReviewSubmit}
              getInitials={getInitials}
            />
          </div>
        </div>
      ) : (
        /* Edit profile form mode */
        <ProfileEditForm
          role={profileData.user?.role}
          formName={formName}
          setFormName={setFormName}
          formPhone={formPhone}
          setFormPhone={setFormPhone}
          formOccupation={formOccupation}
          setFormOccupation={setFormOccupation}
          formCompanyOrCollege={formCompanyOrCollege}
          setFormCompanyOrCollege={setFormCompanyOrCollege}
          formLanguages={formLanguages}
          setFormLanguages={setFormLanguages}
          formBio={formBio}
          setFormBio={setFormBio}
          formAvatarUrl={formAvatarUrl}
          setFormAvatarUrl={setFormAvatarUrl}
          formCoverImageUrl={formCoverImageUrl}
          setFormCoverImageUrl={setFormCoverImageUrl}
          formPreferredLocation={formPreferredLocation}
          setFormPreferredLocation={setFormPreferredLocation}
          formLocationCoords={formLocationCoords}
          setFormLocationCoords={setFormLocationCoords}
          formMoveInDate={formMoveInDate}
          setFormMoveInDate={setFormMoveInDate}
          formBudgetMin={formBudgetMin}
          setFormBudgetMin={setFormBudgetMin}
          formBudgetMax={formBudgetMax}
          setFormBudgetMax={setFormBudgetMax}
          formPreferredRoomType={formPreferredRoomType}
          setFormPreferredRoomType={setFormPreferredRoomType}
          formPreferredFurnishing={formPreferredFurnishing}
          setFormPreferredFurnishing={setFormPreferredFurnishing}
          formGenderPreference={formGenderPreference}
          setFormGenderPreference={setFormGenderPreference}
          formParkingRequired={formParkingRequired}
          setFormParkingRequired={setFormParkingRequired}
          formPetsAllowed={formPetsAllowed}
          setFormPetsAllowed={setFormPetsAllowed}
          formSmokingAllowed={formSmokingAllowed}
          setFormSmokingAllowed={setFormSmokingAllowed}
          handleSave={handleSave}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
}
