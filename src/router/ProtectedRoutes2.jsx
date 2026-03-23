import { Navigate, useLocation } from "react-router-dom";
import { useAuth2 } from "../hooks/useAuth2";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

const ProtectedRoute2 = ({ children }) => {
  const location = useLocation();
  const { token } = useAuth2();
  const { setIsSecondGame, isSecondGame } = useAuth();

  // Ensure we're in second game mode for second game routes
  useEffect(() => {
    setIsSecondGame(true);
  }, [setIsSecondGame]);

  if (!token) {
    return <Navigate to="/network/login" state={{ from: location }} replace />;
  }

  if (!isSecondGame) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute2;
