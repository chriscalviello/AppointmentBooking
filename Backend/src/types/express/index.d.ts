declare namespace Express {
  interface Request {
    user: import("../../models/loggedUser").LoggedUser | undefined;
  }
}
