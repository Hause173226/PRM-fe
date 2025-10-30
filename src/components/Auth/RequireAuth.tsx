import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

const RequireAuth: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const location = useLocation();

  if (!token || !refreshToken) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
