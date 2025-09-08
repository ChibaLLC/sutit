import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db";
import { accounts, sessions, user, verifications } from "../db/schema";
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: user,
			accounts: accounts,
			sessions: sessions,
			verifications: verifications,
		},
	}),

	emailAndPassword: {
		enabled: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			redirectURI: "",
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			redirectURI: "",
		},
	},
	session: {
		modelName: "sessions",

		expiresIn: 604800,
		updateAge: 86400,
		disableSessionRefresh: true,
		storeSessionInDatabase: true,
		preserveSessionInDatabase: false,
		cookieCache: {
			enabled: true,
			maxAge: 300,
		},
	},
	account: {
		modelName: "accounts",
		encryptOAuthTokens: true,
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "github", "email-password"],
			allowDifferentEmails: false,
		},
	},
	verification: {
		modelName: "verifications",
		disableCleanup: false,
	},
});
