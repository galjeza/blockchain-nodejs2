const fs = require("fs");
const message = fs
  .readFileSync(process.env.HUSKY_GIT_PARAMS || process.env.GIT_PARAMS, "utf-8")
  .trim();

const commitMessageRegex =
  /^(feat|fix|docs|style|refactor|test|chore): .{1,50}/;

if (!commitMessageRegex.test(message)) {
  console.error(
    'Invalid commit message format. It should be something like "feat: add new feature".'
  );
  process.exit(1);
}
