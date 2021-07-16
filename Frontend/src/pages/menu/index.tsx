import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

export interface Props {
  items: ItemProps[];
}

export interface ItemProps {
  icon?: React.ReactElement;
  label: string;
  url: string;
}

const Menu: React.FC<Props> = ({ items }) => {
  return (
    <>
      {items.map((mi, i) => (
        <StyledLink key={i} to={mi.url} activeClassName="active">
          <ListItemIcon>{mi.icon}</ListItemIcon>
          <ListItemText primary={mi.label} />
        </StyledLink>
      ))}
    </>
  );
};

const StyledLink = styled(NavLink)`
  display: flex;
  padding: 1rem;
  align-items: center;
  text-decoration: none;

  &.active {
    color: white;
    background: rgb(123 110 171);
  }
`;

export default Menu;
