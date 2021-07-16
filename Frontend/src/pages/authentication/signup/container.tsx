import React from "react";
import { useAuthentication } from "../../../providers/authentication";
import Signup from ".";

const SignupContainer: React.FC = ({}) => {
  const { error, loading, signup } = useAuthentication();

  return (
    <Signup
      error={error}
      loading={loading}
      onActionRequest={signup}
      title="Signup"
    />
  );
};

export default SignupContainer;
