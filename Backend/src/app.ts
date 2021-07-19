import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import mongoose from "mongoose";

import AuthenticationRoutes from "./routes/authentication";
import BookingRoutes from "./routes/booking";
import UserRoutes from "./routes/user";

import HttpError from "./models/httpError";

import AuthenticationService from "./services/authentication";
import BookingService from "./services/booking";
import LogService from "./services/log";
import UserService from "./services/user";

import DatabaseConfig from "./config/database";

class App {
  public app: express.Application;
  public port: number;
  private authenticationService: AuthenticationService;
  private bookingService: BookingService;
  private userService: UserService;

  constructor(
    port: number,
    authenticationService: AuthenticationService,
    bookingService: BookingService,
    userService: UserService
  ) {
    this.app = express();

    this.port = port;
    this.authenticationService = authenticationService;
    this.bookingService = bookingService;
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

    this.app.use(cors());

    this._setSwagger();

    this.app.use(
      "/api/auth",
      new AuthenticationRoutes(this.authenticationService).getRouter()
    );
    this.app.use(
      "/api/booking",
      new BookingRoutes(this.bookingService).getRouter()
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

  private _setSwagger = () => {
    const options: swaggerJsdoc.OAS3Options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "LogRocket Express API with Swagger",
          version: "0.1.0",
          description:
            "This is a simple CRUD API application made with Express and documented with Swagger",
          license: {
            name: "MIT",
            url: "https://spdx.org/licenses/MIT.html",
          },
          contact: {
            name: "LogRocket",
            url: "https://logrocket.com",
            email: "info@email.com",
          },
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "jwt",
            },
          },
        },
        definitions: {
          account: {
            type: "object",
            properties: {
              email: {
                type: "string",
                example: "chris@gmail.com",
                format: "email",
              },
              password: {
                type: "string",
                example: "123456",
                minimum: 6,
              },
              name: {
                type: "string",
                example: "Mario",
              },
            },
            required: ["email", "password", "name"],
          },
          appointment: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              note: {
                type: "string",
              },
              dateStart: {
                type: "string",
                format: "date-time",
                description: "UTC ISO",
              },
              dateEnd: {
                type: "string",
                format: "date-time",
                description: "UTC ISO",
              },
              customer: {
                oneof: [
                  {
                    type: "string",
                  },
                  {
                    type: "object",
                    properties: {
                      $ref: "#/definitions/appointment",
                    },
                  },
                ],
              },
            },
          },
          arrayOfAppointment: {
            type: "array",
            items: {
              $ref: "#/definitions/appointment",
            },
          },
          createAppointmetInput: {
            type: "object",
            properties: {
              dateStart: {
                type: "string",
                format: "date-time",
                description: "UTC ISO",
              },
              dateEnd: {
                type: "string",
                format: "date-time",
                description: "UTC ISO",
              },
            },
            required: ["dateStart", "dateEnd"],
          },
          credentials: {
            type: "object",
            properties: {
              email: {
                type: "string",
                example: "chris@gmail.com",
                format: "email",
              },
              password: {
                type: "string",
                example: "123456",
                minimum: 6,
              },
            },
            required: ["email", "password"],
          },
          id: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
            },
          },
          loggedUser: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              accessToken: {
                type: "string",
              },
              refreshToken: {
                type: "string",
              },
              role: {
                type: "string",
                enum: ["USER", "ADMIN"],
              },
            },
          },
          message: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
          updateUserInput: {
            type: "object",
            properties: {
              email: {
                type: "string",
                example: "chris@gmail.com",
                format: "email",
              },
              id: {
                type: "string",
              },
              name: {
                type: "string",
                example: "Chris2",
              },
              role: {
                type: "string",
                enum: ["USER", "ADMIN"],
                example: "ADMIN",
              },
            },
            required: ["email", "id", "name", "role"],
          },
          user: {
            type: "object",
            properties: {
              appointments: {
                type: "array",
                items: {
                  $ref: "#/definitions/appointment",
                },
              },
              email: {
                type: "string",
                example: "chris@gmail.com",
                format: "email",
              },
              password: {
                type: "string",
                example: "123456",
                minimum: 6,
              },
              name: {
                type: "string",
                example: "Mario",
              },
              role: {
                type: "string",
                enum: ["USER", "ADMIN"],
              },
            },
          },
        },
        paths: {
          "/auth/login": {
            post: {
              summary: "Log in the system and get an authentication token",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/definitions/credentials",
                    },
                  },
                },
              },
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/loggedUser",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/auth/signup": {
            post: {
              summary:
                "Register a new account in the system and get an authentication token",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/definitions/account",
                    },
                  },
                },
              },
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/loggedUser",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/users/delete": {
            post: {
              security: [
                {
                  bearerAuth: [],
                },
              ],
              summary:
                "Delete an account and all its appointments. Allowed to admin only.",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/definitions/id",
                    },
                  },
                },
              },
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                },
                "403": {
                  description:
                    "Forbidden. You should login and included bearer token in the request.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/users/getById?id={id}": {
            get: {
              security: [
                {
                  bearerAuth: [],
                },
              ],
              summary: "Get a user by its id",
              parameters: [
                {
                  in: "path",
                  name: "id",
                  schema: {
                    type: "string",
                  },
                  required: true,
                },
              ],
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/user",
                      },
                    },
                  },
                },
                "403": {
                  description:
                    "Forbidden. You should login and included bearer token in the request.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/users/getAll": {
            get: {
              security: [
                {
                  bearerAuth: [],
                },
              ],
              summary: "Get all users",
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/user",
                      },
                    },
                  },
                },
                "403": {
                  description:
                    "Forbidden. You should login and included bearer token in the request.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/users/save": {
            post: {
              security: [
                {
                  bearerAuth: [],
                },
              ],
              summary: "Update user's email, name and role",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/definitions/updateUserInput",
                    },
                  },
                },
              },
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/user",
                      },
                    },
                  },
                },
                "403": {
                  description:
                    "Forbidden. You should login and included bearer token in the request.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/booking/create": {
            post: {
              security: [
                {
                  bearerAuth: [],
                },
              ],
              summary: "Add an appointment for the logged user",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/definitions/createAppointmetInput",
                    },
                  },
                },
              },
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/appointment",
                      },
                    },
                  },
                },
                "403": {
                  description:
                    "Forbidden. You should login and included bearer token in the request.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/booking/delete": {
            post: {
              security: [
                {
                  bearerAuth: [],
                },
              ],
              summary:
                "Delete an appointment and remove its ref from linked user",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/definitions/id",
                    },
                  },
                },
              },
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                },
                "403": {
                  description:
                    "Forbidden. You should login and included bearer token in the request.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Internal error.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
          "/booking/getByRange?dateStart={dateStart}&dateEnd={dateEnd}": {
            get: {
              security: [
                {
                  bearerAuth: [],
                },
              ],
              summary: "Get appointments in a range",
              parameters: [
                {
                  in: "path",
                  name: "dateStart",
                  schema: {
                    type: "string",
                    format: "date-time",
                    description: "UTC ISO",
                  },
                  example: "2021-07-01T10:00:00.000Z",
                  required: true,
                },
                {
                  in: "path",
                  name: "dateEnd",
                  schema: {
                    type: "string",
                    format: "date-time",
                    description: "UTC ISO",
                  },
                  example: "2021-08-01T10:00:00.000Z",
                  required: true,
                },
              ],
              produces: ["application/json"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/arrayOfAppointment",
                      },
                    },
                  },
                },
                "403": {
                  description:
                    "Forbidden. You should login and included bearer token in the request.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "422": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
                "500": {
                  description: "Failed. Bad post data.",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/definitions/message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        servers: [
          {
            url: "http://localhost:" + this.port + "/api",
          },
        ],
      },
      apis: ["./routes/authentication/index.ts"],
    };

    const specs = swaggerJsdoc(options);

    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
  };
}

export default App;
