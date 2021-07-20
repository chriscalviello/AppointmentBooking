import swaggerJsdoc from "swagger-jsdoc";

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
          email: {
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
          summary:
            "Add an appointment for the logged user. Allowed to users only.",
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
            "Delete an appointment and remove its ref from linked user. Allowed to admin only.",
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
        url: "http://localhost:5000/api",
      },
    ],
  },
  apis: ["./routes/authentication/index.ts"],
};

export default {
  options,
};
