import express, { Request, Response, NextFunction } from "express";

import HttpError from "./models/httpError";

import LogService from "./services/log";

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
      this.listen();
    } catch (err) {
      LogService.error(["Fail", err]);
    }
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
