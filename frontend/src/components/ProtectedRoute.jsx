import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const FullPageLoader = () => (
  <div className="spinner-center" role="status" style={{ minHeight: "100vh", justifyContent: "center" }}>
    <span className="spinner" />
    <span>Loading...</span>
  </div>
);

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
