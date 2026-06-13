import fs from "node:fs";

const [filePath, keyPath] = process.argv.slice(2);

if (!filePath || !keyPath) {
  process.exit(1);
}

const raw = fs.readFileSync(filePath, "utf8");
const withoutBlockComments = raw.replace(/\/\*[\s\S]*?\*\//g, "");
const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, "");
const config = JSON.parse(withoutLineComments);

let value = config;
for (const segment of keyPath.split(".")) {
  value = value?.[segment];
}

if (value === undefined) {
  process.exit(1);
}

if (typeof value === "object") {
  process.stdout.write(JSON.stringify(value));
} else {
  process.stdout.write(String(value));
}
