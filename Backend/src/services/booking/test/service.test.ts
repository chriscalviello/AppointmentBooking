import { BookingService } from "../service";
import Appointment, { IAppointment } from "../../../models/appointment";
import User, { IUser } from "../../../models/user";
import { Roles } from "../../../authorization";
import { UserService } from "../../user/service";
jest.mock("../../user/service");

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("BookingService", () => {
  let mongoServer: MongoMemoryServer;
  let con: typeof mongoose;
  let customer: IUser;

  const sut = new BookingService(new UserService());

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

    UserService.prototype.getById = jest
      .fn()
      .mockImplementation((id: string) => {
        return new Promise<IUser | undefined>((resolve) => {
          resolve(id === "fakeId" ? undefined : customer);
        });
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe("when create", () => {
    const mockedSaveFn = jest
      .spyOn(sut, "saveAppointmentAndAddToCustomer")
      .mockImplementation(() => {
        return new Promise<IAppointment>((resolve) => {
          resolve(new Appointment());
        });
      });

    const mockedCheckFn = jest.spyOn(sut, "checkAvailability");

    it("should reject when customer doesn't exist", async () => {
      await expect(
        sut.create(
          "fakeId",
          new Date(2020, 10, 1, 1),
          new Date(2020, 10, 1, 2),
          "test"
        )
      ).rejects.toBeDefined();
    });

    it("should return a new appointment", async () => {
      const appointment = await sut.create(
        customer.id,
        new Date(2020, 10, 1, 1),
        new Date(2020, 10, 1, 2),
        "test"
      );
      expect(appointment).toBeDefined();
    });

    it("should call 'saveAppointmentAndAddToCustomer'", async () => {
      await sut.create(
        customer.id,
        new Date(2020, 10, 1, 1),
        new Date(2020, 10, 1, 2),
        "test"
      );

      expect(mockedSaveFn).toHaveBeenCalled();
    });

    it("should call 'checkAvailability'", async () => {
      await sut.create(
        customer.id,
        new Date(2020, 10, 1, 1),
        new Date(2020, 10, 1, 2),
        "test"
      );

      expect(mockedCheckFn).toHaveBeenCalled();
    });
  });

  describe("when getByRange", () => {
    it("should return an empty array", async () => {
      const appointments = await sut.getByRange(
        new Date(2020, 10, 1, 7),
        new Date(2020, 10, 1, 7, 59)
      );
      expect(appointments).toHaveLength(0);
    });

    it("should return data", async () => {
      const appointments = await sut.getByRange(
        new Date(2020, 10, 1, 8),
        new Date(2020, 10, 1, 9, 10)
      );
      expect(appointments).toHaveLength(2);
    });
  });

  describe("when getById", () => {
    it("should return data", async () => {
      const appointment = await sut.getById(
        (customer.appointments[0] as IAppointment).id
      );
      expect(appointment).toBeDefined();
    });

    it("should reject", async () => {
      await expect(sut.getById("fakeId")).rejects.toBeDefined();
    });
  });

  describe("when update", () => {
    const mockedCheckFn = jest.spyOn(sut, "checkAvailability");
    it("should call 'checkAvailability'", async () => {
      await sut.update(
        new Date(2020, 10, 1, 9, 30),
        new Date(2020, 10, 1, 10, 40),
        "updated note",
        (customer.appointments[2] as IAppointment).id
      );

      expect(mockedCheckFn).toHaveBeenCalled();
    });
    it("should not call 'checkAvailability'", async () => {
      await sut.update(
        new Date(2020, 10, 1, 8),
        new Date(2020, 10, 1, 8, 30),
        "updated note",
        (customer.appointments[0] as IAppointment).id
      );

      expect(mockedCheckFn).toHaveBeenCalledTimes(0);
    });
    it("should update properties", async () => {
      const newAppointment = await sut.update(
        new Date(2020, 10, 1, 9, 5),
        new Date(2020, 10, 1, 9, 35),
        "updated note",
        (customer.appointments[1] as IAppointment).id
      );

      expect(newAppointment.dateStart.getTime()).toEqual(
        new Date(2020, 10, 1, 9, 5).getTime()
      );
      expect(newAppointment.dateEnd.getTime()).toEqual(
        new Date(2020, 10, 1, 9, 35).getTime()
      );
      expect(newAppointment.note).toEqual("updated note");
    });
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
