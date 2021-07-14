import AuthenticationService from ".";
import User from "../../models/user";
import { LoggedUser } from "../../models/loggedUser";
import { Roles } from "../../authorization";

import jwt from "jsonwebtoken";

export class ConcreteAuthenticationService implements AuthenticationService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private refreshTokens: Record<string, string>;
  private tokenDurationInMinutes: number;

  constructor(
    accessTokenSecret: string,
    refreshTokenSecret: string,
    tokenDurationInMinutes: number
  ) {
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
    this.refreshTokens = {};
    this.tokenDurationInMinutes = tokenDurationInMinutes;
  }

  getLoggedUserByToken = (token: string) => {
    return jwt.verify(token, this.accessTokenSecret) as LoggedUser;
  };

  login = async (email: string, password: string) => {
    //TODO: move this logic in a separate service
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email, password: password });
    } catch (err) {
      throw "Logging in failed, please try again later.";
    }

    if (!existingUser) {
      throw "Logging in failed.";
    }

    return this.createTokensAndGetLoggedUser(
      existingUser.id,
      existingUser.role
    );
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
  signup = async (email: string, password: string, name: string) => {
    //TODO: move this logic in a separate service
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      throw "Cannot find user, please try again later.";
    }

    if (existingUser) {
      throw "User already exists.";
    }

    const createdUser = new User();
    createdUser.name = name;
    createdUser.email = email;
    createdUser.password = password;
    createdUser.role = Roles.user;

    try {
      await createdUser.save();
    } catch (err) {
      throw "Signing up failed. " + err;
    }

    return this.createTokensAndGetLoggedUser(createdUser.id, createdUser.role);
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
