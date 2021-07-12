import { LoggedUser } from "../../models/loggedUser";

interface IAuthenticationService {
  getLoggedUserByToken: (token: string) => LoggedUser;
  login: (email: string, password: string) => Promise<LoggedUser>;
  logout: (token: string) => void;
  refreshToken: (token: string) => LoggedUser;
  signup: (
    email: string,
    password: string,
    name: string
  ) => Promise<LoggedUser>;
}

export default IAuthenticationService;
