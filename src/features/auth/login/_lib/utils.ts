import { genSaltSync, hashSync } from "bcrypt-ts";

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

export function generateDummyPassword() {
  const password = generateId();
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}
