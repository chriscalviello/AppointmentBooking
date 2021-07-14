import UserService from ".";
import User, { IUser } from "../../models/user";
import { Roles } from "../../authorization";

export class ConcreteUserService implements UserService {
  constructor() {}

  delete = async (id: string) => {
    try {
      const x = await User.deleteOne({ _id: id });
      if (!x.deletedCount) {
        throw "No users found.";
      }
    } catch (err) {
      throw "Something went wrong, could not delete user.";
    }
  };
  edit = async (email: string, name: string, id: string, role: Roles) => {
    let user;

    try {
      user = await this.getById(id);
    } catch (err) {
      throw err;
    }

    user.email = email;
    user.name = name;
    user.role = role;

    try {
      await user.save();
    } catch (err) {
      throw "Something went wrong, could not save user.";
    }

    return user;
  };
  getAll = async () => {
    let users: IUser[];

    try {
      users = await User.find({}, "-password");
    } catch (err) {
      throw "Something went wrong, could not retrieve users.";
    }

    return users;
  };
  getById = async (id: string) => {
    let user;

    try {
      user = await User.findById(id, "-password");
    } catch (err) {
      throw "Something went wrong, could not find user.";
    }

    if (!user) {
      throw "Could not find user for the provided id.";
    }

    return user;
  };
}
