import React, { useState } from "react";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export interface ContentProps {
  cta: (date: Date) => void;
  date: Date;
}

const Filters: React.FC<ContentProps> = ({ cta, date, ...rest }) => {
  const [calendarDate, setCalendarDate] = useState<Date>(date);

  const handleDateChange = (date: MaterialUiPickersDate) => {
    if (date) {
      setCalendarDate(date);
      cta(date);
    }
  };

  return (
    <Container {...rest}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DatePicker
          variant="static"
          margin="normal"
          open
          value={calendarDate}
          onChange={handleDateChange}
        />
      </MuiPickersUtilsProvider>
    </Container>
  );
};

const Container = styled.div``;

export default Filters;
