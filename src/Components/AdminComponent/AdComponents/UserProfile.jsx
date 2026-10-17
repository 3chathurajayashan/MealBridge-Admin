import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  UserCheck,
  UserX,
  Hash,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";

import AdminApi from "../../../API/AdminApi";

function UserProfile() {
  const navigate = useNavigate();

  // =====================================================
  // GET CURRENT LOGGED-IN USER
  // =====================================================

  const storedUser = localStorage.getItem("mealbridge-admin-user");

  const user = storedUser ? JSON.parse(storedUser) : null;

  // =====================================================
  // STATE
  // =====================================================

  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",

    email: user?.email || "",

    phoneNumber: user?.phoneNumber || "",

    address: user?.address || "",

    latitude: user?.location?.latitude || "",

    longitude: user?.location?.longitude || "",
  });

  // =====================================================
  // NO USER
  // =====================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 text-[#1D1D1F]">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.04] text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-3">
            Account Not Found
          </h2>

          <p className="text-lg text-[#86868B] mb-8 font-light">
            No active session found. Please log in to view your profile.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 px-6 bg-[#0071E3] hover:bg-[#0077ED] text-white text-lg font-medium rounded-2xl transition-all duration-200 shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // FORM INPUT HANDLER
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // =====================================================
  // IMAGE HANDLER
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedImage(file);
    }
  };

  // =====================================================
  // START EDITING
  // =====================================================

  const handleEdit = () => {
    setFormData({
      fullName: user.fullName || "",

      email: user.email || "",

      phoneNumber: user.phoneNumber || "",

      address: user.address || "",

      latitude: user.location?.latitude || "",

      longitude: user.location?.longitude || "",
    });

    setSelectedImage(null);

    setIsEditing(true);
  };

  // =====================================================
  // CANCEL EDITING
  // =====================================================

  const handleCancelEdit = () => {
    setIsEditing(false);

    setSelectedImage(null);
  };

  // =====================================================
  // UPDATE USER
  // =====================================================

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // ================================================
      // CREATE FORM DATA
      // ================================================

      const data = new FormData();

      data.append("fullName", formData.fullName);

      data.append("email", formData.email);

      data.append("phoneNumber", formData.phoneNumber);

      data.append("address", formData.address);

      // ================================================
      // LOCATION
      // ================================================

      if (formData.latitude !== "" && formData.longitude !== "") {
        data.append(
          "location",
          JSON.stringify({
            latitude: parseFloat(formData.latitude),

            longitude: parseFloat(formData.longitude),
          }),
        );
      }

      // ================================================
      // PROFILE IMAGE
      // ================================================

      if (selectedImage) {
        data.append("profileImage", selectedImage);
      }

      // ================================================
      // SEND UPDATE REQUEST
      // ================================================

      const response = await AdminApi.put(
        `/auth/users/${user.id}`,

        data,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // ================================================
      // GET UPDATED USER
      // ================================================

      const updatedUser = response.data.user;

      // ================================================
      // UPDATE LOCAL STORAGE
      // ================================================

      localStorage.setItem(
        "mealbridge-admin-user",

        JSON.stringify(updatedUser),
      );

      // ================================================
      // SUCCESS
      // ================================================

      alert("Profile updated successfully!");

      setIsEditing(false);

      setSelectedImage(null);

      // Refresh page so updated data is displayed

      window.location.reload();
    } catch (error) {
      console.error("Update Profile Error:", error);

      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      // ================================================
      // DELETE REQUEST
      // ================================================

      await AdminApi.delete(`/auth/users/${user.id}`);

      // ================================================
      // REMOVE LOCAL SESSION
      // ================================================

      localStorage.removeItem("mealbridge-admin-user");

      localStorage.removeItem("mealbridge-admin-token");

      alert("Your account has been deleted successfully.");

      // ================================================
      // REDIRECT TO LOGIN
      // ================================================

      navigate("/login");
    } catch (error) {
      console.error("Delete Account Error:", error);

      alert(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  // =====================================================
  // MAP COORDINATES
  // =====================================================

  const lat = user.location?.latitude
    ? parseFloat(user.location.latitude)
    : null;

  const lng = user.location?.longitude
    ? parseFloat(user.location.longitude)
    : null;

  const hasCoordinates =
    lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const mapUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : null;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto">
        {/* ================================================= */}
        {/* BACK BUTTON */}
        {/* ================================================= */}

        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center space-x-2 text-[#0066CC] hover:text-[#004499] text-lg font-medium mb-10 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />

          <span>Back</span>
        </button>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1D1D1F]">
                Admin Profile
              </h1>

              <p className="text-xl text-[#86868B] font-light mt-2">
                Manage your account details and system permissions.
              </p>
            </div>

            {/* EDIT BUTTON */}

            {!isEditing && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-2xl transition-all shadow-sm"
              >
                <Pencil className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* MAIN CARD */}
        {/* ================================================= */}

        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-black/[0.04]">
          {/* ================================================= */}
          {/* PROFILE HEADER */}
          {/* ================================================= */}

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 pb-10 border-b border-black/[0.06]">
            <div className="text-center">
              {user.profileImage?.url ? (
                <img
                  src={
                    selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : user.profileImage.url
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover shadow-md border-2 border-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#E8E8ED] flex items-center justify-center text-3xl font-semibold text-[#86868B] shadow-inner">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                </div>
              )}

              {/* IMAGE SELECTOR */}

              {isEditing && (
                <label className="inline-block mt-4 cursor-pointer">
                  <span className="text-sm text-[#0071E3] font-medium hover:underline">
                    Change Photo
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                {user.fullName}
              </h2>

              <p className="text-lg text-[#0066CC] font-medium mt-1">
                {user.role}
              </p>

              <div className="mt-4 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow-xs bg-gray-100">
                {user.isActive ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-600" />

                    <span className="text-emerald-700">Active Status</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4 text-rose-500" />

                    <span className="text-rose-600">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* EDIT FORM */}
          {/* ================================================= */}

          {isEditing ? (
            <div className="pt-10 space-y-7">
              {/* FULL NAME */}

              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-black/[0.1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-black/[0.1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-black/[0.1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              {/* ADDRESS */}

              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-2">
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-5 py-4 rounded-2xl border border-black/[0.1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] resize-none"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-3">
                  Location Coordinates
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className="w-full px-5 py-4 rounded-2xl border border-black/[0.1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />

                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className="w-full px-5 py-4 rounded-2xl border border-black/[0.1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>

              {/* ================================================= */}
              {/* ACTION BUTTONS */}
              {/* ================================================= */}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-4 px-6 bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white font-medium rounded-2xl transition-all"
                >
                  <Save className="w-5 h-5" />

                  {isSaving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-4 px-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-[#1D1D1F] font-medium rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ================================================= */
            /* NORMAL PROFILE VIEW */
            /* ================================================= */

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
              {/* USER ID */}

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#86868B] text-sm uppercase tracking-wider font-medium">
                  <Hash className="w-4 h-4" />

                  <span>User ID</span>
                </div>

                <p className="text-xl font-medium text-[#1D1D1F] break-all">
                  {user.id}
                </p>
              </div>

              {/* EMAIL */}

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#86868B] text-sm uppercase tracking-wider font-medium">
                  <Mail className="w-4 h-4" />

                  <span>Email Address</span>
                </div>

                <p className="text-xl font-medium text-[#1D1D1F] break-all">
                  {user.email}
                </p>
              </div>

              {/* PHONE */}

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#86868B] text-sm uppercase tracking-wider font-medium">
                  <Phone className="w-4 h-4" />

                  <span>Phone Number</span>
                </div>

                <p className="text-xl font-medium text-[#1D1D1F]">
                  {user.phoneNumber || "Not provided"}
                </p>
              </div>

              {/* ROLE */}

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#86868B] text-sm uppercase tracking-wider font-medium">
                  <ShieldCheck className="w-4 h-4" />

                  <span>Access Role</span>
                </div>

                <p className="text-xl font-medium text-[#1D1D1F]">
                  {user.role}
                </p>
              </div>

              {/* ADDRESS */}

              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center space-x-2 text-[#86868B] text-sm uppercase tracking-wider font-medium">
                  <MapPin className="w-4 h-4" />

                  <span>Address</span>
                </div>

                <p className="text-xl font-medium text-[#1D1D1F]">
                  {user.address || "Not provided"}
                </p>
              </div>

              {/* MAP */}

              {hasCoordinates ? (
                <div className="space-y-3 md:col-span-2 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[#86868B] text-sm uppercase tracking-wider font-medium">
                      <MapPin className="w-4 h-4" />

                      <span>Location Map</span>
                    </div>

                    <span className="text-sm font-light text-[#86868B]">
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </span>
                  </div>

                  <div className="w-full h-72 rounded-2xl overflow-hidden border border-black/[0.08] shadow-inner bg-gray-100">
                    <iframe
                      title="User Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={mapUrl}
                      style={{ border: 0 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 md:col-span-2 pt-2">
                  <div className="flex items-center space-x-2 text-[#86868B] text-sm uppercase tracking-wider font-medium">
                    <MapPin className="w-4 h-4" />

                    <span>Coordinates</span>
                  </div>

                  <p className="text-xl font-medium text-[#1D1D1F]">
                    Location coordinates not available
                  </p>
                </div>
              )}

              {/* ================================================= */}
              {/* DELETE ACCOUNT */}
              {/* ================================================= */}

              <div className="md:col-span-2 pt-8 mt-4 border-t border-black/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1D1D1F]">
                      Delete Account
                    </h3>

                    <p className="text-sm text-[#86868B] mt-1">
                      Permanently delete your account and profile data.
                    </p>
                  </div>

                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 font-medium rounded-2xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />

                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
