import React from "react";
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
import DeleteIcon from "@material-ui/icons/Delete";

interface Props {
  calendar: FiltersCtaProps;
  error: string;
  loading: boolean;
  onAddRequest: (start: Date, end: Date) => void;
  onDeleteRequest: (id: string) => void;
  slots: AppointmentProps[];
}

export interface AppointmentProps {
  id?: string;
  customer: string;
  dateStart: Date;
  dateEnd: Date;
}

const Bookings: React.FC<Props> = ({
  calendar,
  error,
  loading,
  onAddRequest,
  onDeleteRequest,
  slots,
}) => {
  return (
    <Container>
      <StyledFilters {...calendar} />
      {loading ? (
        <Loading />
      ) : error ? (
        <h1>{error}</h1>
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader aria-label="simple table">
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
                slots.map((s, i) => {
                  const ctas: ItemCtaProps[] = s.id
                    ? [
                        {
                          icon: <DeleteIcon />,
                          onClick: () => {
                            if (
                              confirm(
                                "Are you sure to delete this appointment?"
                              )
                            ) {
                              onDeleteRequest(s.id ? s.id : "");
                            }
                          },
                        },
                      ]
                    : [
                        {
                          icon: <AddIcon />,
                          onClick: () => {
                            if (confirm("Are you sure to book this slot?")) {
                              onAddRequest(s.dateStart, s.dateEnd);
                            }
                          },
                        },
                      ];

                  return (
                    <Appointment
                      key={i}
                      ctas={ctas}
                      customer={s.customer}
                      start={s.dateStart.toLocaleTimeString()}
                      end={s.dateEnd.toLocaleTimeString()}
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
