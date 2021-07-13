import express, { Router } from "express";
import { check } from "express-validator";

import UserController from "../../controllers/user";
import UserService from "../../services/user";
import { AllowRouteTo, Roles } from "../../authorization";

import Validation from "../validation";

class UserRoutes {
  private router: Router;
  constructor(userService: UserService) {
    this.router = express.Router();

    const controller = new UserController(userService);

    this.router.post(
      "/delete",
      [check("id").not().isEmpty()],
      AllowRouteTo([Roles.admin]),
      Validation.validate,
      controller.delete
    );
    this.router.get("/get", AllowRouteTo([Roles.admin]), controller.get);
    this.router.post(
      "/save",
      [
        check("name").not().isEmpty(),
        check("email").normalizeEmail().isEmail(),
        check("id").not().isEmpty(),
        check("role").not().isEmpty(),
      ],
      AllowRouteTo([Roles.admin]),
      Validation.validate,
      controller.save
    );
  }

  getRouter = () => this.router;
}

export default UserRoutes;
