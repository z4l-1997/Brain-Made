import "server-only";

import { and, asc, count, desc, eq, gt, gte, inArray, lt, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ChatSDKError } from "../errors";
import { User, user } from "./schema/user";
import { generateHashedPassword } from "./utils";
import { generateUUID } from "../utils";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get user by email");
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({
      email,
      password: hashedPassword,
      role: "regular",
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create guest user");
  }
}

export async function getAllUsers(): Promise<Array<User>> {
  try {
    return await db.select().from(user).orderBy(asc(user.email));
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get all users");
  }
}
