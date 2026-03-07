import { betterAuth } from "better-auth";

/**
 * Better Auth Server Configuration
 */
export const auth = betterAuth({
    database: {
        url: process.env.DATABASE_URL!,
        type: "postgres"
    },
    emailAndPassword: {
        enabled: true
    }
});
