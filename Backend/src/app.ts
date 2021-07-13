import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import AuthenticationRoutes from "./routes/authentication";
import UserRoutes from "./routes/user";

import HttpError from "./models/httpError";

import AuthenticationService from "./services/authentication";
import LogService from "./services/log";
import UserService from "./services/user";

import DatabaseConfig from "./config/database";

class App {
  public app: express.Application;
  public port: number;
  private authenticationService: AuthenticationService;
  private userService: UserService;

  constructor(
    port: number,
    authenticationService: AuthenticationService,
    userService: UserService
  ) {
    this.app = express();

    this.port = port;
    this.authenticationService = authenticationService;
    this.userService = userService;

    this.configureServerAndRoutes();
  }

  public start = async () => {
    try {
      await this.connectToDb();
      this.listen();
    } catch (err) {
      LogService.error(["Fail", err]);
    }
  };

  private connectToDb = () => {
    if (!DatabaseConfig.url) {
      throw "Connection to database is missing!";
    }

    const conn = mongoose.connection;
    conn.on("error", (err) => {
      LogService.error(["Mongoose error", err]);
    });
    conn.once("open", () => {
      LogService.write(["Connected to mongodb"], "green");
    });

    return mongoose.connect(DatabaseConfig.url);
  };

  private listen() {
    this.app.listen(this.port, () => {
      LogService.write([`App listening on the port ${this.port}`], "green");
    });
  }

  private configureServerAndRoutes = () => {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        try {
          req.user = this.authenticationService.getLoggedUserByToken(token);
        } catch (err) {
          const error = new HttpError("Session expired.", 401);
          throw error;
        }
      }

      next();
    });

    this.app.use(
      "/api/auth",
      new AuthenticationRoutes(this.authenticationService).getRouter()
    );
    this.app.use("/api/users", new UserRoutes(this.userService).getRouter());

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const error = new HttpError("Could not find this route.", 404);
      throw error;
    });

    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        if (res.headersSent) {
          return next(error);
        }
        res.status(error.code || 500);
        res.json({ message: error.message || "An unknown error occurred!" });
      }
    );
  };
}

export default App;
