import { Request, Response, NextFunction } from "express";
import HttpError from "../../models/httpError";
import AuthenticationService from "../../services/authentication";

export default class AuthenticationController {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
      const user = await this.authenticationService.login(email, password);
      res.json({ user });
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };

  signup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    try {
      const user = await this.authenticationService.signup(
        email,
        password,
        name
      );
      res.json({ user });
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };
}
