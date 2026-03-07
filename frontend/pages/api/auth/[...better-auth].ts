import { auth } from "../../../src/utils/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth Next.js API Route Handler
 */
export const { GET, POST } = toNextJsHandler(auth);
