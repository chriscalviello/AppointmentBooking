import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Loading from "../../components/loading";
import Filters, { ContentProps as CtaProps } from "./filters";
import Appointment from "./appointment";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

interface Props {
  appointments: AppointmentProps[];
  calendar: CtaProps;
  error: string;
  loading: boolean;
}

export interface AppointmentProps {
  id: string;
  dateStart: Date;
  dateEnd: Date;
}

const Bookings: React.FC<Props> = ({
  appointments,
  calendar,
  error,
  loading,
}) => {
  const history = useHistory();

  return (
    <Container>
      <h1>Bookings</h1>
      <StyledFilters {...calendar} />
      {loading ? (
        <Loading />
      ) : error ? (
        <h1>{error}</h1>
      ) : (
        <>
          {appointments.length ? (
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((a, i) => {
                    return (
                      <Appointment
                        key={i}
                        customer={a.id}
                        start={a.dateStart.toLocaleTimeString()}
                        end={a.dateEnd.toLocaleTimeString()}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <b>There are no appointments for the provided range</b>
          )}
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledFilters = styled(Filters)`
  margin-bottom: 1rem;
`;

export default Bookings;
