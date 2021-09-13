import * as snowflake from "snowflake-regex";

export function parse(token: string) {
  if (token.charAt(24) !== "." || token.charAt(31) !== ".")
    throw Error("Invalid Token");
  const [encoded] = token.split(".");
  const decoded = Buffer.from(encoded, "base64").toString();
  if (!snowflake.test(decoded)) throw Error("Invalid Token");
  return decoded;
}

export function parseAll(tokens: string[]) {
  return tokens.map(parse);
}