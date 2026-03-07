import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const token = localStorage.getItem("access");
  if (!token) {
    return < Navigate to="/login" replace />
  }
  return < Outlet />
}
