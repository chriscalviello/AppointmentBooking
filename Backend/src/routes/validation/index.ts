import { Request, Response, NextFunction } from "express";
const { validationResult } = require("express-validator");
import HttpError from "../../models/httpError";

export default class Validation {
  static validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return next(new HttpError("Invalid inputs, please check your data.", 422));
  };
}
