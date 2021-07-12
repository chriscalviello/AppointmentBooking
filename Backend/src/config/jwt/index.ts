require("dotenv").config();

export default {
  accessTokenSecret:
    process.env.ACCESS_TOKEN_SECRET || "DEFAULT_ACCESS_TOKEN_SECRET",
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET || "DEFAULT_REFRESH_TOKEN_SECRET",
};
