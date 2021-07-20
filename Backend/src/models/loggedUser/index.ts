import { Roles } from "../../authorization";

export class LoggedUser {
  id: string;
  email: string;
  role: Roles;
  accessToken: string | undefined;
  refreshToken: string | undefined;

  constructor(
    id: string,
    email: string,
    role: Roles,
    accessToken?: string,
    refreshToken?: string
  ) {
    this.id = id;
    this.email = email;
    this.role = role;

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
