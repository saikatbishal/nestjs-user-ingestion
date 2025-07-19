module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*.spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  reporters: ["default", "../jest.result-logger.js"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "src/main.ts",
    ".module.ts$",
    ".entity.ts$",
    ".dto.ts$",
    ".enum.ts$",
    "src/database/seed.ts",
    "src/database/migrations/",
    "src/common/decorators/",
    ".spec.ts$",
    ".test.ts$"
  ]
};
