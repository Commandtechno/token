import { execSync, spawn } from "child_process";

import { filterValid } from "./validate";
import { name } from "../package.json";

try {
  execSync("gh");
} catch {
  console.log("GitHub CLI must be installed (https://cli.github.com/)");
  process.exit();
}

const args = process.argv;
const tokens = filterValid(args.map(a => a.trim())).map(t => t + "\n");
if (!tokens.length) {
  console.log("No tokens specified, put any tokens here to reset them");
  process.exit();
}

const desc = "Tokens reported by " + name + " cli";
const flags = ["filename tokens.txt", "desc '" + desc + "'"];

const shell = { shell: "powershell" };
const options = ["gist", "create", ...flags.map(f => "--" + f)];

console.log("Posting " + tokens.length + " tokens...");
const { stdin, stdout } = spawn("gh", options, shell);

stdout.on("data", (buf: Buffer) => {
  let str = buf.toString().trim();
  if (!str.startsWith("http")) return;
  if (args.includes("-o") || args.includes("--open"))
    execSync("start " + str, shell);

  console.log("Posted " + str);
  console.log("Deleting gist in 10 seconds");
  setTimeout(() => {
    console.log("Deleting...");
    execSync("gh gist delete " + str);
    console.log("Deleted");
  }, 10000);
});

stdin.write(tokens.join(""), "utf-8");
stdin.end();