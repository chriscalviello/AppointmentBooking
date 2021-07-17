import express, { Router } from "express";
import { check } from "express-validator";

import BookingController from "../../controllers/booking";
import BookingService from "../../services/booking";
import { AllowRouteTo, Roles } from "../../authorization";

import Validation from "../validation";

class BookingRoutes {
  private router: Router;
  constructor(bookingService: BookingService) {
    this.router = express.Router();

    const controller = new BookingController(bookingService);

    this.router.post(
      "/create",
      [check("dateStart").not().isEmpty(), check("dateEnd").not().isEmpty()],
      AllowRouteTo([Roles.user]),
      Validation.validate,
      controller.create
    );
    this.router.post(
      "/delete",
      [check("id").not().isEmpty()],
      AllowRouteTo([Roles.admin]),
      Validation.validate,
      controller.delete
    );
    this.router.get(
      "/getByRange",
      [check("dateStart").not().isEmpty(), check("dateEnd").not().isEmpty()],
      AllowRouteTo([Roles.admin, Roles.user]),
      Validation.validate,
      controller.getByRange
    );
    this.router.post(
      "/update",
      [
        check("id").not().isEmpty(),
        check("dateStart").not().isEmpty(),
        check("dateEnd").not().isEmpty(),
      ],
      AllowRouteTo([Roles.admin, Roles.admin]),
      Validation.validate,
      controller.update
    );
  }

  getRouter = () => this.router;
}

export default BookingRoutes;
