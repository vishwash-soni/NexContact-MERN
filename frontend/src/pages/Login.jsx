import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Shows a message when the server rejects the login attempt.
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      login(response.data);
      navigate("/contacts");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.png" alt="NexContact logo" />
        </div>

        {/* Header */}
        <div className="login-header">
          <h1>Welcome to NexContact</h1>
          <p>Please enter your email and password to login.</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          {serverError && <p className="form-error banner">{serverError}</p>}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
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
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <div className="register-link">
          <p>Don't have an account?</p>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </main>
  );
}
