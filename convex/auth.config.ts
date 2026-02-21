import type { AuthConfig } from 'convex/server'

export default {
  providers: [
    {
      // Set CLERK_JWT_ISSUER_DOMAIN in the Convex Dashboard (Settings → Environment Variables).
      // Get the Issuer URL from Clerk Dashboard → JWT Templates → your "convex" template.
      // Dev: https://verb-noun-00.clerk.accounts.dev | Prod: https://clerk.<your-domain>.com
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig
