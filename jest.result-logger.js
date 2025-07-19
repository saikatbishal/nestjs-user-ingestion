const fs = require("fs");
const path = require("path");

class ResultLogger {
  onRunComplete(_, results) {
    const testResults = results.testResults.flatMap((suite) =>
      suite.testResults.map((test) => ({
        suite: suite.testFilePath,
        name: test.fullName,
        status: test.status,
        failureMessages: test.failureMessages,
        duration: test.duration,
      }))
    );
    const resultPath = path.resolve(__dirname, "result.json");
    fs.writeFileSync(resultPath, JSON.stringify(testResults, null, 2));
  }
}

module.exports = ResultLogger;
