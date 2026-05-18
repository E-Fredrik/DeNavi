import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

/**
 * Generate a secure, readable access code for organizers.
 * Format: NAV-XXXXXX (6 alphanumeric uppercase characters)
 */
export function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous: 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NAV-${code}`;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    // apple: {
    //   clientId: process.env.APPLE_CLIENT_ID || "",
    //   clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    // },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: false,
        defaultValue: "INDIVIDUAL",
        input: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
        returned: true,
      },
      organizerName: {
        type: "string",
        required: false,
        input: true,
      },
      accessCode: {
        type: "string",
        required: false,
        input: false, // Never set by client; generated server-side
        returned: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const data = user as Record<string, unknown>;
          const accountType = (data.accountType as string) || "INDIVIDUAL";

          // Generate access code for organizers
          if (accountType === "ORGANIZER") {
            let code = generateAccessCode();
            let existing = await prisma.user.findUnique({ where: { accessCode: code } });
            while (existing) {
              code = generateAccessCode();
              existing = await prisma.user.findUnique({ where: { accessCode: code } });
            }
            data.accessCode = code;
          }

          return { data: data as typeof user };
        },
        after: async (user) => {
          const data = user as Record<string, unknown>;
          // Auto-create the Organizer record if accountType is ORGANIZER
          if ((data.accountType as string) === "ORGANIZER") {
            await prisma.organizer.create({
              data: {
                name: (data.organizerName as string) || (data.name as string) || "Organizer",
                email: data.email as string,
                authUserId: data.id as string,
                authProvider: "BETTER_AUTH",
                tokenBalance: 1,
                accessCode: data.accessCode as string | undefined,
              },
            });
          }
        },
      },
    },
  },
});
