import { Request, Response, NextFunction } from "express";
import HttpError from "../../models/httpError";
import UserService from "../../services/user";
import { Roles } from "../../authorization";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.id;

    try {
      await this.userService.delete(userId);

      res.status(200).json();
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.id as string;

    try {
      if (userId) {
        const user = this.userService.getById(userId);
        if (!user) {
          return next(new HttpError("User does not exist", 500));
        }
        res.json({ users: [user] });
      } else {
        const users = this.userService.getAll();
        res.json({ users });
      }
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };

  save = async (req: Request, res: Response, next: NextFunction) => {
    const { email, id, name, role } = req.body;

    const mappedRole = Object.values(Roles).find(
      (r) => r.toString().toLowerCase() === (role as string).toLowerCase()
    );
    if (!mappedRole) {
      return next(
        new HttpError("The provided user's role is not recognized", 500)
      );
    }

    try {
      if (!req.user || (req.user.role === "USER" && req.user.id !== id)) {
        return next(
          new HttpError("You are not allowed to edit other users", 403)
        );
      }

      const user = await this.userService.edit(email, name, id, mappedRole);
      res.json({ user });
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };
}

export default UserController;