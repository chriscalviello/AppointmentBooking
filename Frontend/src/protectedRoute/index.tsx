import React from "react";
import { Route, Redirect } from "react-router-dom";

import { useAuthentication } from "../providers/authentication";

const ProtectedRoute = ({ ...rest }) => {
  const { currentUser } = useAuthentication();
  return currentUser ? (
    <Route {...rest} />
  ) : (
    <Redirect to={{ pathname: "/login" }} />
  );
};

export default ProtectedRoute;
