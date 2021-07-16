import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Form from "../../../components/form";
import Roles, { Props as RolesProps } from "../roles";
import Loading from "../../../components/loading";

interface Props {
  user: User;
  error: string;
  onActionRequest: React.Dispatch<User>;
  onCancelRequest: React.DispatchWithoutAction;
  loading: boolean;
  roles: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const EditUser: React.FC<Props> = ({
  user,
  error,
  loading,
  onActionRequest,
  onCancelRequest,
  roles,
}) => {
  const [id, setId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    if (!user) {
      return;
    }
    setId(user.id);
    setEmail(user.email);
    setName(user.name);
    setRole(user.role);
  }, [user]);

  const handleSaveRequest = () => {
    setEmailError(!email ? "Email is required" : "");
    setNameError(!name ? "Name is required" : "");

    if (email && name) {
      onActionRequest({ id: user.id, email, name, role });
    }
  };

  const handleEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError("");
    setEmail(e.target.value);
  };

  const handleNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameError("");
    setName(e.target.value);
  };

  const handleRoleChanged = (newRole: string) => {
    setRole(newRole);
  };

  return (
    <Container>
      <h1>Edit user</h1>
      {loading ? (
        <Loading />
      ) : error ? (
        <h1>{error}</h1>
      ) : (
        <Form
          ctas={[
            {
              label: "Save",
              primary: true,
              onClick: handleSaveRequest,
            },
            {
              label: "Cancel",
              onClick: onCancelRequest,
            },
          ]}
          extra={
            <Roles
              roles={roles}
              selectedRole={role}
              onRoleChange={handleRoleChanged}
            />
          }
          inputs={[
            {
              error: emailError,
              label: "Email",
              onChange: handleEmailChanged,
              type: "TEXT",
              value: email,
            },
            {
              error: nameError,
              label: "Name",
              onChange: handleNameChanged,
              type: "TEXT",
              value: name,
            },
          ]}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export default EditUser;
