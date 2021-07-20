import React, { useEffect, useState } from "react";

import API from "../../api";

import { useAuthentication } from "../../providers/authentication";
import { useBookingData } from "../../providers/bookingData";

import Calendar, { AppointmentProps } from ".";

const CalendarContainer: React.FC = ({}) => {
  const { searchQuery, updateSearchQuery } = useBookingData();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuthentication();
  const [slots, setSlots] = useState<AppointmentProps[]>([]);

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
        const appointments: AppointmentProps[] = responseData.appointments.map(
          (a: any) => {
            const appointment: AppointmentProps = {
              id: a._id,
              customer: a.customer.email,
              dateStart: new Date(a.dateStart),
              dateEnd: new Date(a.dateEnd),
            };
            return appointment;
          }
        );

        const data: AppointmentProps[] = searchQuery.slots.map((s) => {
          const appointment = appointments.filter(
            (a) =>
              a.dateStart.getTime() === s.start.getTime() &&
              a.dateEnd.getTime() === s.end.getTime()
          );

          return appointment.length
            ? appointment[0]
            : {
                customer: "Free Slot",
                dateStart: s.start,
                dateEnd: s.end,
              };
        });

        setSlots(data);
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onAddRequest = (start: Date, end: Date) => {
    setLoading(true);
    setError("");
    API.post(
      "/booking/create",
      {
        dateStart: start.toUTCString(),
        dateEnd: end.toUTCString(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + currentUser?.token,
        },
      }
    )
      .then((res) => {
        const responseData = res.data;

        if (!responseData.newAppointment._id) {
          throw new Error("Something went wrong");
        }

        fetchAppointments();
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onDeleteRequest = async (id: string) => {
    setLoading(true);
    setError("");

    API.post(
      "/booking/delete",
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + currentUser?.token,
        },
      }
    )
      .then(() => {
        fetchAppointments();
      })
      .catch((err) => {
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, [searchQuery]);

  return (
    <Calendar
      onAddRequest={onAddRequest}
      onDeleteRequest={onDeleteRequest}
      calendar={{
        cta: (date: Date) => {
          updateSearchQuery(date);
        },
        date: searchQuery.start,
      }}
      error={error}
      loading={loading}
      slots={slots}
    />
  );
};

export default CalendarContainer;
