import DatabaseService from "../../services/database";
import UserService from ".";
import { User } from "../../models/user";
import { Roles } from "../../authorization";

export class FakeUserService implements UserService {
  private databaseService: DatabaseService;
  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  delete = (id: string) => {
    const users = this.getAll();

    const userIndex = users.findIndex((u: User) => u.id === id);
    if (userIndex === -1) {
      throw "The provided user doesn't exist";
    }
    users.splice(userIndex, 1);

    this.databaseService.updateData(users);
  };
  create = (
    email: string,
    password: string,
    name: string,
    surname: string,
    role: Roles
  ) => {
    const users = this.getAll();

    const newUser = new User(email, password, name, surname, role);
    users.push({ ...newUser });

    this.databaseService.updateData(users);

    return newUser;
  };
  edit = (
    email: string,
    name: string,
    surname: string,
    id: string,
    role: Roles
  ) => {
    const users = this.getAll();

    const user = users.find((u: User) => u.id === id);
    if (!user) {
      throw "The provided user doesn't exist";
    }
    user.email = email;
    user.name = name;
    user.surname = surname;
    user.role = role;

    this.databaseService.updateData(users);

    return user;
  };
  getAll = () => {
    return this.databaseService.getUsers();
  };
  getById = (id: string) => {
    const users = this.getAll();

    return users.find((u: User) => u.id === id);
  };
}
