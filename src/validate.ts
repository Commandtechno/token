import { parse } from "./parse";

export function validate(token: string) {
  try {
    parse(token);
  } catch {
    return false;
  }

  return true;
}

export function validateAll(tokens: string[]) {
  return tokens.every(validate);
}

export function filterValid(tokens: string[]) {
  return tokens.filter(validate);
}