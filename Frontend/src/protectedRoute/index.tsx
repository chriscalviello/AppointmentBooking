import React from "react";
import { useAuthentication } from "../providers/authentication";

import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ ...rest }) => {
  const { currentUser } = useAuthentication();
  return currentUser ? (
    <Route {...rest} />
  ) : (
    <Redirect to={{ pathname: "/login" }} />
  );
};

export default ProtectedRoute;
