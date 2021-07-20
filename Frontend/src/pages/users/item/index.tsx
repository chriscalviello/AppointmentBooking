import React, { MouseEventHandler } from "react";

import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";

interface Props {
  ctas?: CtaProps[];
  email: string;
  name: string;
  role: string;
}

export interface CtaProps {
  icon: React.ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const Item: React.FC<Props> = ({ ctas, email, name, role, ...rest }) => {
  return (
    <TableRow>
      <TableCell>{email}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{role}</TableCell>
      <TableCell>
        {ctas &&
          ctas?.map((c, i) => (
            <IconButton key={i} onClick={c.onClick}>
              {c.icon}
            </IconButton>
          ))}
      </TableCell>
    </TableRow>
  );
};

export default Item;
