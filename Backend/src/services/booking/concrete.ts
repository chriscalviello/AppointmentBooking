import BookingService from ".";
import UserService from "../user";
import Appointment, { IAppointment } from "../../models/appointment";
import { IUser } from "../../models/user";

import { startSession, Types } from "mongoose";

export class ConcreteBookingService implements BookingService {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  checkAvailability = async (
    dateStart: Date,
    dateEnd: Date,
    appointmentIdToIgnore?: string
  ) => {
    let isFree = false;
    try {
      const appointments = await Appointment.where("id")
        .ne(appointmentIdToIgnore)
        .or([
          {
            dateStart: {
              $gte: dateStart,
              $lte: dateEnd,
            },
          },
          {
            dateEnd: {
              $gte: dateStart,
              $lte: dateEnd,
            },
          },
        ]);
      isFree = appointments.length === 0;
    } catch (err) {
      throw "Something went wrong, could not check availability.";
    }
    return isFree;
  };

  create = async (
    customerId: string,
    dateStart: Date,
    dateEnd: Date,
    note: string
  ) => {
    try {
      if (!this.checkAvailability(dateStart, dateEnd)) {
        throw "Selected slot is not free, try with other dates.";
      }
    } catch (err) {
      throw err;
    }

    const appointment = new Appointment();
    appointment.dateStart = dateStart;
    appointment.dateEnd = dateEnd;
    appointment.note = note;
    appointment.customer = customerId;

    let customer;
    try {
      customer = await this.userService.getById(customerId);
    } catch (err) {
      throw err;
    }

    if (!customer) {
      throw "Could not find customer.";
    }

    try {
      const sess = await startSession();
      sess.startTransaction();
      await appointment.save({ session: sess });
      (customer.appointments as IAppointment[]).push(appointment);
      await customer.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      throw "Something went wrong, could not save the appointment.";
    }

    return appointment;
  };
  delete = async (id: string) => {
    let appointment;
    try {
      appointment = await this.getById(id);
    } catch (err) {
      throw err;
    }

    try {
      const sess = await startSession();
      sess.startTransaction();

      const customer = appointment.customer as IUser;
      const userAppointments = customer.appointments as string[];
      const index = userAppointments.indexOf(appointment.id);
      userAppointments.splice(index, 1);

      await customer.save({ session: sess });
      await appointment.remove({ session: sess });

      await sess.commitTransaction();
    } catch (err) {
      console.log(err);
      throw "Something went wrong, could not remove the appointment.";
    }
  };
  getById = async (id: string) => {
    let appointment;

    try {
      appointment = await Appointment.findById(id).populate("customer");
    } catch (err) {
      throw "Something went wrong, could not find the appointment.";
    }

    if (!appointment) {
      throw "Could not find any appointment for the provided id.";
    }

    return appointment;
  };
  getByRange = async (dateStart: Date, dateEnd: Date, customerId?: string) => {
    let appointments: IAppointment[];

    try {
      appointments = customerId
        ? await Appointment.find()
            .and([{ customer: customerId }])
            .or([
              {
                dateStart: {
                  $gte: dateStart,
                  $lte: dateEnd,
                },
              },
              {
                dateEnd: {
                  $gte: dateStart,
                  $lte: dateEnd,
                },
              },
            ])
        : await Appointment.find().or([
            {
              dateStart: {
                $gte: dateStart,
                $lte: dateEnd,
              },
            },
            {
              dateEnd: {
                $gte: dateStart,
                $lte: dateEnd,
              },
            },
          ]);
    } catch (err) {
      throw "Something went wrong, could not retrieve appointments.";
    }

    return appointments;
  };
  update = async (dateStart: Date, dateEnd: Date, note: string, id: string) => {
    let appointment;
    try {
      appointment = await this.getById(id);
    } catch (err) {
      throw err;
    }

    if (
      appointment.dateStart !== dateStart ||
      appointment.dateEnd !== dateEnd
    ) {
      try {
        if (!this.checkAvailability(dateStart, dateEnd, appointment.id)) {
          throw "Selected slot is not free, try with other dates.";
        }
      } catch (err) {
        throw err;
      }
    }
    appointment.dateStart = dateStart;
    appointment.dateEnd = dateEnd;
    appointment.note = note;
    try {
      await appointment.save();
    } catch (err) {
      throw "Something went wrong, could not save the appointment.";
    }

    return appointment;
  };
}
