import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import HttpError from "./models/httpError";

import LogService from "./services/log";

import DatabaseConfig from "./config/database";

class App {
  public app: express.Application;
  public port: number;

  constructor(port: number) {
    this.app = express();

    this.port = port;

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
