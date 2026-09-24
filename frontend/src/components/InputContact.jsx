import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiFileText,
  FiSave,
  FiImage,
} from "react-icons/fi";

import "../styles/UpdateContact.css";
import api from "../api/axios";

// Shared form for both adding a new contact and updating an existing one.
function UpdateContact() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const update = location.state?.update;

  const [serverError, setServerError] = useState("");
  const [imagePreview, setImagePreview] = useState(
    update?.imageUrl || null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: update?.name || "",
      phone: update?.phone || "",
      email: update?.email || "",
      notes: update?.notes || "",
    },
  });

  // Watch selected image
  const selectedImage = watch("image");

  // Handle image preview
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview(update?.imageUrl || null);
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setServerError(
        "Only JPG, PNG and WEBP images are allowed"
      );
      event.target.value = "";
      return;
    }

    // Check file size - 5MB
    if (file.size > 5 * 1024 * 1024) {
      setServerError("Image size must be less than 5MB");
      event.target.value = "";
      return;
    }

    setServerError("");

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const onSubmit = async (data) => {
    setServerError("");

    // Create FormData
    const formData = new FormData();

    // Add normal fields
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("notes", data.notes || "");

    // Add image only if user selected a new image
    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }

    try {
      if (update) {
        await api.put(
          `/mydata/updatemycontact/${id}`,
          formData
        );

        alert("Contact updated successfully");
      } else {
        await api.post(
          "/mydata/addcontact",
          formData
        );

        alert("Contact added successfully");
      }

      navigate(-1);
    } catch (error) {
      console.error("Contact error:", error);

      setServerError(
        error.response?.data?.message ||
          "Something went wrong, please try again"
      );
    }
  };

  return (
    <div className="update-contact-page">

      {/* Back Button */}
      <button
        type="button"
        className="update-back-button"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft />
        <span>Back</span>
      </button>

      {/* Form Card */}
      <div className="update-contact-card">

        {/* Header */}
        <div className="update-header">

          <div className="update-header-icon">
            <FiUser />
          </div>

          <div>
            <h1>
              {update ? "Update Contact" : "Add Contact"}
            </h1>

            <p>
              {update
                ? "Update the contact information below"
                : "Add a new contact below"}
            </p>
          </div>

        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Server Error */}
          {serverError && (
            <p className="form-error banner">
              {serverError}
            </p>
          )}

          {/* ================= IMAGE ================= */}
          <div className="update-form-group">

            <label htmlFor="image">
              Profile Image
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #ddd",
                  }}
                />
              </div>
            )}

            <div className="image-upload-wrapper">

              <FiImage className="image-upload-icon" />

              <div className="image-upload-content">

                <span>
                  {selectedImage?.[0]
                    ? selectedImage[0].name
                    : "Choose a profile image"}
                </span>

                <small>
                  {selectedImage?.[0]
                    ? `${(
                        selectedImage[0].size / 1024
                      ).toFixed(1)} KB`
                    : "JPG, PNG or WEBP • Max 5MB"}
                </small>

              </div>

              <input
                id="image"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                {...register("image")}
                onChange={(event) => {
                  // React Hook Form's onChange
                  register("image").onChange(event);

                  // Our preview logic
                  handleImageChange(event);
                }}
              />

            </div>

          </div>

          {/* ================= NAME ================= */}
          <div className="update-form-group">

            <label htmlFor="name">
              Name
            </label>

            <div className="update-input-wrapper">

              <FiUser />

              <input
                id="name"
                type="text"
                placeholder="Enter contact name"
                {...register("name", {
                  required: "Name is required",
                })}
              />

            </div>

            {errors.name && (
              <p className="form-error">
                {errors.name.message}
              </p>
            )}

          </div>

          {/* ================= PHONE ================= */}
          <div className="update-form-group">

            <label htmlFor="phone">
              Phone
            </label>

            <div className="update-input-wrapper">

              <FiPhone />

              <input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                {...register("phone", {
                  required: "Phone number is required",
                })}
              />

            </div>

            {errors.phone && (
              <p className="form-error">
                {errors.phone.message}
              </p>
            )}

          </div>

          {/* ================= EMAIL ================= */}
          <div className="update-form-group">

            <label htmlFor="email">
              Email
            </label>

            <div className="update-input-wrapper">

              <FiMail />

              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email", {
                  required: "Email is required",

                  pattern: {
                    value:
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />

            </div>

            {errors.email && (
              <p className="form-error">
                {errors.email.message}
              </p>
            )}

          </div>

          {/* ================= NOTES ================= */}
          <div className="update-form-group">

            <label htmlFor="notes">
              Notes
            </label>

            <div className="update-input-wrapper update-textarea-wrapper">

              <FiFileText />

              <textarea
                id="notes"
                rows="5"
                placeholder="Add some notes..."
                {...register("notes")}
              />

            </div>

          </div>

          {/* ================= SUBMIT ================= */}
          <button
            type="submit"
            className="update-submit-button"
            disabled={isSubmitting}
          >

            <FiSave />

            <span>
              {isSubmitting
                ? "Saving..."
                : update
                ? "Update Contact"
                : "Add Contact"}
            </span>

          </button>

        </form>

      </div>

    </div>
  );
}

export default UpdateContact;
