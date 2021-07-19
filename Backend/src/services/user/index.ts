import { IUser } from "../../models/user";
import { Roles } from "../../authorization";

export interface IUserService {
  delete: (id: string) => Promise<void>;
  edit: (
    email: string,
    name: string,
    id: string,
    role: Roles
  ) => Promise<IUser>;
  getAll: () => Promise<IUser[]>;
  getByEmail: (email: string) => Promise<IUser | undefined>;
  getById: (userId: string) => Promise<IUser | undefined>;
}
