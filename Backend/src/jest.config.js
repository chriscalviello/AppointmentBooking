module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {},
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["./src/jestSetup.js"],
};
