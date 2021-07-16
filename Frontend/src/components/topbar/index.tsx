import React, { MouseEventHandler } from "react";
import styled from "styled-components";
import IconButton from "@material-ui/core/IconButton";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { useAuthentication } from "../../providers/authentication";

interface Props {
  title: string;
}

const Topbar: React.FC<Props> = ({ title, ...rest }) => {
  const { currentUser, logout } = useAuthentication();
  return (
    <Container {...rest}>
      <AppBar position="static">
        <StyledToolbar>
          <h3>{title}</h3>
          <div>
            {currentUser && (
              <>
                <b>{currentUser.email}</b>
                <IconButton onClick={logout}>
                  <MeetingRoomIcon />
                </IconButton>
              </>
            )}
          </div>
        </StyledToolbar>
      </AppBar>
    </Container>
  );
};

const Container = styled.div`
  flex: 0;
  display: flex;
`;

const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
`;

export default Topbar;
