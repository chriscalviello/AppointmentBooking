import { IAppointment } from "../../models/appointment";

interface IBookingService {
  checkAvailability: (
    dateStart: Date,
    dateEnd: Date,
    appointmentIdToIgnore?: string
  ) => Promise<Boolean>;
  create: (
    customerId: string,
    dateStart: Date,
    dateEnd: Date,
    note: string
  ) => Promise<IAppointment>;
  delete: (id: string) => Promise<void>;
  getById: (id: string) => Promise<IAppointment>;
  getByRange: (
    dateStart: Date,
    dateEnd: Date,
    customerId?: string
  ) => Promise<IAppointment[]>;
  update: (
    dateStart: Date,
    dateEnd: Date,
    id: string,
    note: string
  ) => Promise<IAppointment>;
}

export default IBookingService;
