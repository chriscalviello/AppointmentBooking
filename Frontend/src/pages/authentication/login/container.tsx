import React from "react";
import { useAuthentication } from "../../../providers/authentication";
import Signup from ".";

const LoginContainer: React.FC = ({}) => {
  const { error, loading, login } = useAuthentication();

  return (
    <Signup
      error={error}
      loading={loading}
      onActionRequest={login}
      title="Login"
    />
  );
};

export default LoginContainer;
