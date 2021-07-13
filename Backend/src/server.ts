import { ConcreteAuthenticationService } from "./services/authentication/concrete";
import { ConcreteUserService } from "./services/user/concrete";
import JwtConfig from "./config/jwt";
import App from "./app";

const app = new App(
  5000,
  new ConcreteAuthenticationService(
    JwtConfig.accessTokenSecret,
    JwtConfig.refreshTokenSecret
  ),
  new ConcreteUserService()
);

app.start();
