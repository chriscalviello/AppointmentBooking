import { IUserService } from ".";
import User, { IUser } from "../../models/user";
import { IAppointment } from "../../models/appointment";
import { Roles } from "../../authorization";

import { startSession } from "mongoose";

export class UserService implements IUserService {
  constructor() {}

  delete = (id: string) => {
    return new Promise<void>(async (resolve, reject) => {
      let user;
      try {
        user = await this.getById(id);
        if (!user) {
          reject("Could not find user");
          return;
        }
        await this.deleteUserAndLinkedAppointments(user);
      } catch (err) {
        reject("Something went wrong, could not delete user.");
        return;
      }
      resolve();
    });
  };
  deleteUserAndLinkedAppointments = (customer: IUser) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const sess = await startSession();
        sess.startTransaction();
        (customer.appointments as IAppointment[]).map(
          async (a) => await a.remove({ session: sess })
        );
        await customer.remove({ session: sess });
        await sess.commitTransaction();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };
  edit = (email: string, name: string, id: string, role: Roles) => {
    return new Promise<IUser>(async (resolve, reject) => {
      let user;

      try {
        user = await this.getById(id);
      } catch (err) {
        reject(err);
        return;
      }

      if (!user) {
        reject("Could not find user");
        return;
      }

      user.email = email;
      user.name = name;
      user.role = role;

      try {
        await user.save();
      } catch (err) {
        reject("Something went wrong, could not save user.");
        return;
      }

      resolve(user);
    });
  };
  getAll = () => {
    return new Promise<IUser[]>(async (resolve, reject) => {
      let users: IUser[];

      try {
        users = await User.find({}, "-password");
      } catch (err) {
        reject("Something went wrong, could not retrieve users.");
        return;
      }

      resolve(users);
    });
  };
  getByEmail = (email: string) => {
    return new Promise<IUser | undefined>(async (resolve, reject) => {
      let user;

      try {
        user = await User.find({
          email: email,
        });
      } catch (err) {
        reject("Something went wrong, could not find user.");
        return;
      }

      resolve(!user || !user.length ? undefined : user[0]);
    });
  };
  getById = (id: string) => {
    return new Promise<IUser | undefined>(async (resolve, reject) => {
      let user;

      try {
        user = await User.findById(id, "-password").populate({
          path: "appointments",
        });
      } catch (err) {
        reject("Something went wrong, could not find user.");
        return;
      }

      resolve(user ? user : undefined);
    });
  };
}
