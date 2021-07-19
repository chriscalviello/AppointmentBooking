import { UserService } from "../service";
import Appointment, { IAppointment } from "../../../models/appointment";
import User, { IUser } from "../../../models/user";
import { Roles } from "../../../authorization";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("UserService", () => {
  let mongoServer: MongoMemoryServer;
  let con: typeof mongoose;
  let user: IUser;
  let admin: IUser;
  let userToBeDeleted: IUser;

  const sut = new UserService();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    con = await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      dbName: "verifyMASTER",
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    user = new User();
    user.name = "test";
    user.email = "test@email.it";
    user.password = "password";
    user.role = Roles.user;
    await user.save();
    await saveAppointment(
      new Date(2020, 10, 1, 8, 0),
      new Date(2020, 10, 1, 8, 30),
      user
    );

    admin = new User();
    admin.name = "admin";
    admin.email = "admin@email.it";
    admin.password = "password";
    admin.role = Roles.admin;
    await admin.save();

    userToBeDeleted = new User();
    userToBeDeleted.name = "test to be deleted";
    userToBeDeleted.email = "test2@email.it";
    userToBeDeleted.password = "password";
    userToBeDeleted.role = Roles.user;
    await userToBeDeleted.save();
  });

  afterAll(async () => {
    await mongoServer.stop(true);
    await con.disconnect();
  });

  describe("when delete", () => {
    const mockedDeleteFn = jest
      .spyOn(sut, "deleteUserAndLinkedAppointments")
      .mockImplementation(() => {
        return new Promise<void>((resolve) => {
          resolve();
        });
      });

    it("when delete should call deleteUserAndLinkedAppointments", async () => {
      await sut.delete(userToBeDeleted.id);

      expect(mockedDeleteFn).toHaveBeenCalled();
    });

    it("when delete a not existing user should reject", async () => {
      await expect(sut.delete("123456789012")).rejects.toBeDefined();
    });
  });

  it("when edit should update data", async () => {
    const updatedUser = await sut.edit(
      "newmail@mail.mail",
      "new name",
      user.id,
      user.role
    );
    expect(updatedUser.email).toEqual("newmail@mail.mail");
    expect(updatedUser.name).toEqual("new name");
    expect(updatedUser.id).toEqual(user.id);
  });

  it("when edit not existing user should reject", async () => {
    await expect(
      sut.edit("newmail@mail.mail", "new name", "223456789012", user.role)
    ).rejects.toBeDefined();
  });

  it("when getAll should return data", async () => {
    const users = await sut.getAll();
    expect(users.length).toEqual(3);
  });

  it("when getByEmail should return data", async () => {
    const data = await sut.getByEmail("admin@email.it");
    expect(data).toBeDefined();
    expect(data && data.email).toEqual("admin@email.it");
    expect(data && data.name).toEqual("admin");
  });

  it("when getByEmail should return undefined", async () => {
    const data = await sut.getByEmail("fake@email.it");
    expect(data).toBeUndefined();
  });

  it("when getById should return undefined", async () => {
    const data = await sut.getById("123456789012");
    expect(data).toBeUndefined();
  });

  it("when getById should return user", async () => {
    const data = await sut.getById(admin.id);
    expect(data).toBeDefined();
    expect(data && data.email).toEqual("admin@email.it");
    expect(data && data.password).toBeUndefined();
  });
});

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
