import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { token, setIsSecondGame } = useAuth();

  // Ensure we're in trade mode for trade routes
  useEffect(() => {
    setIsSecondGame(false);
  }, [setIsSecondGame]);

  if (!token) {
    return <Navigate to="/trade/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
