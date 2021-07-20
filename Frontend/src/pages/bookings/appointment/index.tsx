import React, { MouseEventHandler } from "react";

import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";

interface Props {
  ctas: CtaProps[];
  customer: string;
  end: string;
  start: string;
}

export interface CtaProps {
  icon: React.ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const Appointment: React.FC<Props> = ({ ctas, customer, end, start }) => {
  return (
    <TableRow>
      <TableCell>{customer}</TableCell>
      <TableCell>{start}</TableCell>
      <TableCell>{end}</TableCell>
      <TableCell>
        {ctas.map((c, i) => (
          <IconButton key={i} onClick={c.onClick}>
            {c.icon}
          </IconButton>
        ))}
      </TableCell>
    </TableRow>
  );
};

export default Appointment;
