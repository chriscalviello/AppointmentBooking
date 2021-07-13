import { Request, Response, NextFunction } from "express";

export const AllowRouteTo = (allowedRoles: Roles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    if (
      user &&
      allowedRoles.some((x) => x.toString() === user.role.toString())
    ) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "You are not allowed to access this resource" });
    }
  };
};

export enum Roles {
  user = "USER",
  admin = "ADMIN",
}
