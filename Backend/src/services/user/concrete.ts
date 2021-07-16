import UserService from ".";
import User, { IUser } from "../../models/user";
import { Roles } from "../../authorization";

export class ConcreteUserService implements UserService {
  constructor() {}

  delete = (id: string) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const x = await User.deleteOne({ _id: id });
        if (!x.deletedCount) {
          reject("No users found.");
          return;
        }
      } catch (err) {
        reject("Something went wrong, could not delete user.");
        return;
      }
      resolve();
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
        users = await User.find({}, "-password").populate("appointments");
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
        user = await User.findById(id, "-password").populate("appointments");
      } catch (err) {
        reject("Something went wrong, could not find user.");
        return;
      }

      resolve(user ? user : undefined);
    });
  };
}
