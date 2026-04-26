import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Get the current Better Auth session on the server side.
 * Returns the session object or null if not authenticated.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
