import { ConcreteBookingService } from "../concrete";
import Appointment, { IAppointment } from "../../../models/appointment";
import User, { IUser } from "../../../models/user";
import { Roles } from "../../../authorization";
import { ConcreteUserService } from "../../user/concrete";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("ConcreteBookingService", () => {
  let mongoServer: MongoMemoryServer;
  let con: typeof mongoose;
  let customer: IUser;
  const sut = new ConcreteBookingService(new ConcreteUserService());

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    con = await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      dbName: "verifyMASTER",
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    customer = await saveCustomer("test@test.it");
    await saveAppointment(
      new Date(2020, 10, 1, 8, 0),
      new Date(2020, 10, 1, 8, 30),
      customer
    );
    await saveAppointment(
      new Date(2020, 10, 1, 9, 0),
      new Date(2020, 10, 1, 9, 30),
      customer
    );
    await saveAppointment(
      new Date(2020, 10, 1, 9, 30),
      new Date(2020, 10, 1, 10, 30),
      customer
    );
  });

  afterAll(async () => {
    await mongoServer.stop(true);
    await con.disconnect();
  });

  describe("when checkAvailability for an existing appointment", () => {
    it("should return false when one date is between other appointment's range", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 9, 0),
        new Date(2020, 10, 1, 10, 25),
        (customer.appointments[1] as IAppointment).id
      );

      expect(x).toBeFalsy();
    });

    it("should return false when given range is between other appointments' range", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 8, 10),
        new Date(2020, 10, 1, 9, 10),
        (customer.appointments[1] as IAppointment).id
      );

      expect(x).toBeFalsy();
    });

    it("should return false when given range is not between other appointments' range", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 7, 0),
        new Date(2020, 10, 1, 11, 0),
        (customer.appointments[1] as IAppointment).id
      );

      expect(x).toBeFalsy();
    });

    it("should return true when there is a free spot", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 12, 10),
        new Date(2020, 10, 1, 12, 20),
        (customer.appointments[1] as IAppointment).id
      );

      expect(x).toBeTruthy();
    });

    it("should return true when make it shorter", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 9, 0),
        new Date(2020, 10, 1, 9, 20),
        (customer.appointments[1] as IAppointment).id
      );

      expect(x).toBeTruthy();
    });
  });

  describe("when checkAvailability for a new appointment", () => {
    it("should return false when one date is between other appointment's range", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 8, 30),
        new Date(2020, 10, 1, 9, 15)
      );
      expect(x).toBeFalsy();
    });

    it("should return false when given range is between other appointments' range", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 8, 10),
        new Date(2020, 10, 1, 9, 10)
      );

      expect(x).toBeFalsy();
    });

    it("should return false when given range is not between other appointments' range", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 7, 0),
        new Date(2020, 10, 1, 11, 0)
      );

      expect(x).toBeFalsy();
    });

    it("should return true when there is a free spot", async () => {
      const x = await sut.checkAvailability(
        new Date(2020, 10, 1, 8, 30),
        new Date(2020, 10, 1, 9, 0)
      );

      expect(x).toBeTruthy();
    });
  });

  it("should return false when one date is between other appointment's range", async () => {
    const x = await sut.checkAvailability(
      new Date(2020, 10, 1, 8, 30),
      new Date(2020, 10, 1, 9, 15)
    );
    expect(x).toBeFalsy();
  });
});

const saveCustomer = async (email: string) => {
  const customer = new User();
  customer.name = "test";
  customer.email = email;
  customer.password = "password";
  customer.role = Roles.user;
  await customer.save();
  return customer;
};

const saveAppointment = async (
  dateStart: Date,
  dateEnd: Date,
  customer: IUser
) => {
  const appointment = new Appointment();
  appointment.dateStart = dateStart;
  appointment.dateEnd = dateEnd;
  appointment.customer = customer.id;
  await appointment.save();
  (customer.appointments as IAppointment[]).push(appointment);
  await customer.save();
};
