import express, { Router } from "express";
import { check } from "express-validator";

import AuthenticationController from "../../controllers/authentication";
import { IAuthenticationService } from "../../services/authentication";

import Validation from "../validation";

export default class AuthenticationRoutes {
  private router: Router;
  constructor(authenticationService: IAuthenticationService) {
    this.router = express.Router();

    const controller = new AuthenticationController(authenticationService);

    this.router.post(
      "/login",
      [
        check("email").normalizeEmail().isEmail(),
        check("password").not().isEmpty(),
      ],
      Validation.validate,
      controller.login
    );
    this.router.post(
      "/signup",
      [
        check("name").not().isEmpty(),
        check("email").normalizeEmail().isEmail(),
        check("password").not().isEmpty(),
      ],
      Validation.validate,
      controller.signup
    );
  }

  getRouter = () => this.router;
}
