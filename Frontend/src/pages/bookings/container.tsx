import React, { useEffect, useState } from "react";
import { useAuthentication } from "../../providers/authentication";
import Calendar, { AppointmentProps } from ".";
import API from "../../api";
import { useBookingData } from "../../providers/bookingData";

const CalendarContainer: React.FC = ({}) => {
  const { searchQuery, updateSearchQuery } = useBookingData();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuthentication();
  const [appointments, setAppointments] = useState<AppointmentProps[]>([]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    API.get(
      "/booking/getByRange?dateStart=" +
        searchQuery.start.toUTCString() +
        "&dateEnd=" +
        searchQuery.end.toUTCString(),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + currentUser?.token,
        },
      }
    )
      .then((res) => {
        const responseData = res.data;
        setAppointments(
          responseData.appointments.map((a: any) => {
            const appointment: AppointmentProps = {
              id: a._id,
              dateStart: new Date(a.dateStart),
              dateEnd: new Date(a.dateEnd),
            };
            return appointment;
          })
        );
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onCta = (date: Date) => {
    updateSearchQuery(date);
  };

  useEffect(() => {
    fetchAppointments();
  }, [searchQuery]);

  return (
    <Calendar
      appointments={appointments}
      calendar={{
        cta: onCta,
        date: searchQuery.start,
      }}
      error={error}
      loading={loading}
    />
  );
};

export default CalendarContainer;
