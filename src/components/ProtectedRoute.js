// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Get the current user from context

  // If the user is not authenticated, redirect to the login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the children (protected components)
  return children;
};

export default ProtectedRoute;
