import AuthenticationService from ".";
import UserService from "../user";
import User from "../../models/user";
import { LoggedUser } from "../../models/loggedUser";
import { Roles } from "../../authorization";

import jwt from "jsonwebtoken";

export class ConcreteAuthenticationService implements AuthenticationService {
  private userService: UserService;

  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private refreshTokens: Record<string, string>;
  private tokenDurationInMinutes: number;

  constructor(
    accessTokenSecret: string,
    refreshTokenSecret: string,
    tokenDurationInMinutes: number,
    userService: UserService
  ) {
    this.userService = userService;

    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
    this.refreshTokens = {};
    this.tokenDurationInMinutes = tokenDurationInMinutes;
  }

  getLoggedUserByToken = (token: string) => {
    return jwt.verify(token, this.accessTokenSecret) as LoggedUser;
  };

  login = (email: string, password: string) => {
    return new Promise<LoggedUser>(async (resolve, reject) => {
      let existingUser;
      try {
        existingUser = await this.userService.getByEmail(email);
      } catch (err) {
        reject(err);
        return;
      }

      if (!existingUser || existingUser.password !== password) {
        reject("Logging in failed.");
        return;
      }

      resolve(
        this.createTokensAndGetLoggedUser(existingUser.id, existingUser.role)
      );
    });
  };
  logout = (token: string) => {
    delete this.refreshTokens[token];
  };
  refreshToken = (token: string) => {
    const user = jwt.verify(token, this.refreshTokenSecret) as LoggedUser;
    if (!user || !this.refreshTokens[user.id]) {
      throw "Invalid refresh token";
    }
    const accessToken = jwt.sign({ ...user }, this.accessTokenSecret, {
      expiresIn: "20m",
    });

    user.refreshToken = token;
    user.accessToken = accessToken;

    return user;
  };
  signup = (email: string, password: string, name: string) => {
    return new Promise<LoggedUser>(async (resolve, reject) => {
      let existingUser;
      try {
        existingUser = await this.userService.getByEmail(email);
      } catch (err) {
        reject(err);
        return;
      }

      if (existingUser) {
        reject("User already exists.");
        return;
      }

      const createdUser = new User();
      createdUser.name = name;
      createdUser.email = email;
      createdUser.password = password;
      createdUser.role = Roles.user;

      try {
        await createdUser.save();
      } catch (err) {
        reject("Signing up failed. " + err);
        return;
      }

      resolve(
        this.createTokensAndGetLoggedUser(createdUser.id, createdUser.role)
      );
    });
  };

  private createTokensAndGetLoggedUser = (userId: string, role: Roles) => {
    const accessToken = this.getJwtToken(
      userId,
      role,
      this.accessTokenSecret,
      this.tokenDurationInMinutes + "m"
    );
    const refreshToken = this.getJwtToken(
      userId,
      role,
      this.refreshTokenSecret
    );

    this.refreshTokens[userId] = refreshToken;

    return new LoggedUser(userId, role, accessToken, refreshToken);
  };

  private getJwtToken = (
    userId: string,
    role: Roles,
    tokenSecret: string,
    expiresIn?: string
  ) =>
    jwt.sign(
      { ...new LoggedUser(userId, role) },
      tokenSecret,
      expiresIn ? { expiresIn } : undefined
    );
}
