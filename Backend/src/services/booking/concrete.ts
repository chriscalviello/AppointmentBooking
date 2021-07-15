import BookingService from ".";
import UserService from "../user";
import Appointment, { IAppointment } from "../../models/appointment";
import { IUser } from "../../models/user";

import { startSession } from "mongoose";

export class ConcreteBookingService implements BookingService {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  checkAvailability = (
    dateStart: Date,
    dateEnd: Date,
    appointmentIdToIgnore?: string
  ) => {
    return new Promise<boolean>(async (resolve, reject) => {
      let isFree = false;
      try {
        const appointments = await Appointment.find().and([
          { _id: { $ne: appointmentIdToIgnore } },
          {
            $or: this._getRangeCondition(dateStart, dateEnd),
          },
        ]);
        isFree = appointments.length === 0;
      } catch (err) {
        reject("Something went wrong, could not check availability.");
        return;
      }
      resolve(isFree);
    });
  };

  create = (
    customerId: string,
    dateStart: Date,
    dateEnd: Date,
    note: string
  ) => {
    return new Promise<IAppointment>(async (resolve, reject) => {
      try {
        if (!this.checkAvailability(dateStart, dateEnd)) {
          reject("Selected slot is not free, try with other dates.");
          return;
        }
      } catch (err) {
        reject(err);
        return;
      }

      let appointment = new Appointment();
      appointment.dateStart = dateStart;
      appointment.dateEnd = dateEnd;
      appointment.note = note;
      appointment.customer = customerId;

      let customer;
      try {
        customer = await this.userService.getById(customerId);
      } catch (err) {
        reject(err);
        return;
      }

      if (!customer) {
        reject("Could not find customer.");
        return;
      }

      try {
        appointment = await this.saveAppointmentAndAddToCustomer(
          appointment,
          customer
        );
      } catch (err) {
        reject("Something went wrong, could not save the appointment.");
        return;
      }

      resolve(appointment);
    });
  };
  saveAppointmentAndAddToCustomer = (
    appointment: IAppointment,
    customer: IUser
  ) => {
    return new Promise<IAppointment>(async (resolve, reject) => {
      const sess = await startSession();
      sess.startTransaction();
      await appointment.save({ session: sess });
      (customer.appointments as IAppointment[]).push(appointment);
      await customer.save({ session: sess });
      await sess.commitTransaction();
      resolve(appointment);
    });
  };
  delete = (id: string) => {
    return new Promise<void>(async (resolve, reject) => {
      let appointment;
      try {
        appointment = await this.getById(id);
      } catch (err) {
        reject(err);
        return;
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
        reject("Something went wrong, could not remove the appointment.");
        return;
      }
      resolve();
    });
  };
  getById = (id: string) => {
    return new Promise<IAppointment>(async (resolve, reject) => {
      let appointment;

      try {
        appointment = await Appointment.findById(id).populate("customer");
      } catch (err) {
        reject("Something went wrong, could not find the appointment.");
        return;
      }

      if (!appointment) {
        reject("Could not find any appointment for the provided id.");
        return;
      }

      resolve(appointment);
    });
  };
  getByRange = (dateStart: Date, dateEnd: Date, customerId?: string) => {
    return new Promise<IAppointment[]>(async (resolve, reject) => {
      let appointments: IAppointment[];

      try {
        appointments = customerId
          ? await Appointment.find()
              .and([{ customer: customerId }])
              .or(this._getRangeCondition(dateStart, dateEnd))
          : await Appointment.find().or(
              this._getRangeCondition(dateStart, dateEnd)
            );
      } catch (err) {
        reject("Something went wrong, could not retrieve appointments.");
        return;
      }

      resolve(appointments);
    });
  };
  update = (dateStart: Date, dateEnd: Date, note: string, id: string) => {
    return new Promise<IAppointment>(async (resolve, reject) => {
      let appointment;
      try {
        appointment = await this.getById(id);
      } catch (err) {
        reject(err);
        return;
      }

      if (
        appointment.dateStart !== dateStart ||
        appointment.dateEnd !== dateEnd
      ) {
        try {
          if (!this.checkAvailability(dateStart, dateEnd, appointment.id)) {
            reject("Selected slot is not free, try with other dates.");
            return;
          }
        } catch (err) {
          reject(err);
          return;
        }
      }
      appointment.dateStart = dateStart;
      appointment.dateEnd = dateEnd;
      appointment.note = note;
      try {
        await appointment.save();
      } catch (err) {
        reject("Something went wrong, could not save the appointment.");
        return;
      }

      resolve(appointment);
    });
  };

  private _getRangeCondition = (dateStart: Date, dateEnd: Date) => [
    {
      dateStart: {
        $gt: dateStart,
        $lt: dateEnd,
      },
    },
    {
      dateEnd: {
        $gt: dateStart,
        $lt: dateEnd,
      },
    },
  ];
}
