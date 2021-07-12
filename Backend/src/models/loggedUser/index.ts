import { Roles } from "../../authorization";

export class LoggedUser {
  id: string;
  role: Roles;
  accessToken: string | undefined;
  refreshToken: string | undefined;

  constructor(
    id: string,
    role: Roles,
    accessToken?: string,
    refreshToken?: string
  ) {
    this.id = id;
    this.role = role;

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
