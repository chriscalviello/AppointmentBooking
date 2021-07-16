import React from "react";
import ErrorIcon from "@material-ui/icons/Error";
import styled from "styled-components";

const NotFound: React.FC = () => {
  return (
    <Container>
      <ErrorIcon color="secondary" fontSize="large" />
      <h1>404 error</h1>
      <h2>This page doesn't exists</h2>
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default NotFound;
