import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps a page and redirects to /login if no user is logged in.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
