import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

interface Props {
  customer: string;
  end: string;
  start: string;
}

const Appointment: React.FC<Props> = ({ customer, end, start }) => {
  return (
    <TableRow>
      <TableCell>{customer}</TableCell>
      <TableCell>{start}</TableCell>
      <TableCell>{end}</TableCell>
    </TableRow>
  );
};

export default Appointment;
