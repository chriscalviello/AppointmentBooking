import { AuthenticationService } from "./services/authentication/service";
import { BookingService } from "./services/booking/service";
import { UserService } from "./services/user/service";
import JwtConfig from "./config/jwt";
import App from "./app";

const userService = new UserService();

const app = new App(
  5000,
  new AuthenticationService(
    JwtConfig.accessTokenSecret,
    JwtConfig.refreshTokenSecret,
    60 * 10,
    userService
  ),
  new BookingService(userService),
  userService
);

app.start();
