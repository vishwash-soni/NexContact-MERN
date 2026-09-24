import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");

    try {
      await api.post("/auth/register", {
        email: data.email,
      });

      // Remember the email so VerifyOTP can prefill it.
      localStorage.setItem("email", data.email);
      navigate("/verify-otp");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Could not register, please try again"
      );
    }
  };

  return (
    <main className="register-page">
      <div className="register-container">
        {/* Logo */}
        <div className="register-logo">
          <img src="/logo.png" alt="NexContact logo" />
        </div>

        {/* Header */}
        <div className="register-header">
          <h1>Create your account</h1>
          <p>Enter your email to get started with NexContact.</p>
        </div>

        {/* Register Form */}
        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <p className="register-error banner">{serverError}</p>
          )}

          <div className="register-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="register-error">{errors.email.message}</p>
            )}
          </div>

          <button className="register-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : "Continue"}
          </button>
        </form>

        {/* Login Link */}
        <div className="register-login">
          <p>Already have an account?</p>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </main>
  );
}
