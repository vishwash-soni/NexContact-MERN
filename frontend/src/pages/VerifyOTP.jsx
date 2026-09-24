import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "../styles/VerifyOTP.css";
import api from "../api/axios";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const savedEmail = localStorage.getItem("email") || "";

  const [serverError, setServerError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: savedEmail },
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      await api.post("/auth/emailverification", {
        name: data.name,
        email: data.email,
        otp: data.otp,
        password: data.password,
      });

      navigate("/login");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Verification failed, please try again"
      );
    }
  };

  const regenerateOTP = async () => {
    setResending(true);
    setResendMessage("");

    try {
      await api.post("/auth/resendotp", { email: savedEmail });
      setResendMessage("A new OTP has been sent to your email.");
    } catch (error) {
      setResendMessage(
        error.response?.data?.message || "Could not resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="verify-page">
      <div className="verify-container">
        {/* Logo */}
        <div className="verify-logo">
          <img src="/logo.png" alt="NexContact logo" />
        </div>

        {/* Header */}
        <div className="verify-header">
          <h1>Verify Your Email</h1>
          <p>
            We have sent a verification code to your email. Please enter the
            details below to continue.
          </p>
        </div>

        {/* Form */}
        <form className="verify-form" onSubmit={handleSubmit(onSubmit)}>
          {serverError && <p className="form-error banner">{serverError}</p>}

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          {/* Email (prefilled from registration, still editable) */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          {/* OTP */}
          <div className="form-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "OTP must be 6 digits",
                },
              })}
            />
            {errors.otp && <p className="form-error">{errors.otp.message}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Verify Button */}
          <button className="verify-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Regenerate OTP */}
        <div className="regenerate-section">
          <p>Didn't receive the OTP?</p>
          <button
            type="button"
            className="regenerate-button"
            onClick={regenerateOTP}
            disabled={resending}
          >
            {resending ? "Regenerating OTP..." : "Regenerate OTP"}
          </button>
          {resendMessage && <p className="form-error">{resendMessage}</p>}
        </div>

        {/* Go Home */}
        <div className="home-link">
          <Link to="/">Go Home</Link>
        </div>
      </div>
    </main>
  );
}
