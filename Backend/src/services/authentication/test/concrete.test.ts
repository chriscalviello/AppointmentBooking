import { ConcreteAuthenticationService } from "../concrete";
import { ConcreteUserService } from "../../user/concrete";
jest.mock("../../user/concrete");

import User, { IUser } from "../../../models/user";
import { Roles } from "../../../authorization";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("ConcreteAuthenticationService", () => {
  let mongoServer: MongoMemoryServer;
  let con: typeof mongoose;
  let user: IUser;
  const userService = new ConcreteUserService();

  const accessTokenSecret = "accessTokenSecret";
  const refreshTokenSecret = "refreshTokenSecret";

  const sut = new ConcreteAuthenticationService(
    accessTokenSecret,
    refreshTokenSecret,
    60,
    userService
  );

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

    ConcreteUserService.prototype.getByEmail = jest
      .fn()
      .mockImplementation((email: string) => {
        return new Promise<IUser | undefined>((resolve) => {
          resolve(email.startsWith("fake") ? undefined : user);
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

  it("when login should return LoggedUser", async () => {
    const loggedUser = await sut.login(user.email, user.password);
    expect(loggedUser.id).toEqual(user.id);
  });

  it("when login with wrong password should reject", async () => {
    await expect(sut.login(user.email, "wrong password")).rejects.toBeDefined();
  });

  it("when login with should call UserService", async () => {
    const mockedFn = jest.spyOn(userService, "getByEmail");
    await sut.login(user.email, user.password);
    expect(mockedFn).toHaveBeenCalled();
  });

  it("when signup should return LoggedUser", async () => {
    const loggedUser = await sut.signup("fake1", "password", "new user");
    expect(loggedUser).toBeDefined();
  });

  it("when signup with existing email should reject", async () => {
    await expect(
      sut.signup(user.email, "password", "new user")
    ).rejects.toBeDefined();
  });

  it("when signup should call UserService", async () => {
    const mockedFn = jest.spyOn(userService, "getByEmail");
    await sut.signup("fake2", "password", "new user");
    expect(mockedFn).toHaveBeenCalled();
  });
});
