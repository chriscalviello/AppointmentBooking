import { ConcreteAuthenticationService } from "./services/authentication/concrete";
import { ConcreteBookingService } from "./services/booking/concrete";
import { ConcreteUserService } from "./services/user/concrete";
import JwtConfig from "./config/jwt";
import App from "./app";

const userService = new ConcreteUserService();

const app = new App(
  5000,
  new ConcreteAuthenticationService(
    JwtConfig.accessTokenSecret,
    JwtConfig.refreshTokenSecret,
    60 * 10
  ),
  new ConcreteBookingService(userService),
  userService
);

app.start();
