import React from "react";
import { Navigate, useRouterState } from "@tanstack/react-router";

function ProtectedRoute({ user, children }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (!user) {
    // Redirect to login, preserving the intended destination via search params
    return (
      <Navigate
        to="/login"
        search={{ from: currentPath }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;