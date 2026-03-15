// ─────────────────────────────────────────────────────────────────────────────
// packages/api-client/src/client.ts
// Typed tRPC client factory used by all apps (web and mobile).
// Rule 13: mobile apps NEVER import from packages/db — only through this client.
// ─────────────────────────────────────────────────────────────────────────────
import { createTRPCClient, httpBatchLink, splitLink, httpSubscriptionLink } from "@trpc/client";
import { type AppRouter } from "./router-type.js";

export interface CreateApiClientOptions {
  /** Base URL of the Next.js app, e.g. http://localhost:3000 */
  baseUrl: string;
  /** Optional function to return the auth token (Bearer for mobile) */
  getToken?: () => string | null | undefined;
}

/**
 * Create a typed tRPC client.
 * Use in:
 *  - Next.js app: getToken returns the Auth.js session token
 *  - Expo mobile: getToken returns the JWT access token from SecureStore
 */
export function createApiClient(options: CreateApiClientOptions) {
  const { baseUrl, getToken } = options;

  const trpcUrl = `${baseUrl}/api/trpc`;

  return createTRPCClient<AppRouter>({
    links: [
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({
          url: trpcUrl,
          // Note: headers not supported on httpSubscriptionLink in tRPC v11 SSE mode.
          // Auth token is passed as query param by the caller for subscriptions.
        }),
        false: httpBatchLink({
          url: trpcUrl,
          headers: () => {
            const token = getToken?.();
            return token !== null && token !== undefined
              ? { Authorization: `Bearer ${token}` }
              : {};
          },
        }),
      }),
    ],
  });
}

export type { AppRouter };
