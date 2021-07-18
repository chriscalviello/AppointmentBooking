import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Loading from "../../components/loading";
import Filters, { ContentProps as FiltersCtaProps } from "./filters";
import Appointment, { CtaProps as ItemCtaProps } from "./appointment";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import AddIcon from "@material-ui/icons/Add";

interface Props {
  slots: AppointmentProps[];
  calendar: FiltersCtaProps;
  error: string;
  loading: boolean;
}

export interface AppointmentProps {
  id?: string;
  customer: string;
  dateStart: Date;
  dateEnd: Date;
}

const Bookings: React.FC<Props> = ({ slots, calendar, error, loading }) => {
  const history = useHistory();

  const addCta: ItemCtaProps = {
    icon: <AddIcon />,
    onClick: () => console.log("CIAO"),
  };

  return (
    <Container>
      <StyledFilters {...calendar} />
      {loading ? (
        <Loading />
      ) : error ? (
        <h1>{error}</h1>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.length ? (
                slots.map((a, i) => {
                  return (
                    <Appointment
                      key={i}
                      ctas={a.id ? [] : [addCta]}
                      customer={a.customer}
                      start={a.dateStart.toLocaleTimeString()}
                      end={a.dateEnd.toLocaleTimeString()}
                    />
                  );
                })
              ) : (
                <Appointment ctas={[]} customer={"-"} start={"-"} end={"-"} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
`;

const StyledFilters = styled(Filters)`
  margin-bottom: 1rem;
  margin-right: 1rem;
`;

export default Bookings;
