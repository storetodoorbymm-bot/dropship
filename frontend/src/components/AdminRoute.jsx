import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (!user || user.role !== "admin") {
    return <Navigate to="/not-authorized" />;
  }
  return children;
}
