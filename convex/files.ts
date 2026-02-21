import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireUserId } from './lib/auth'

/**
 * Generate an upload URL for authenticated users.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Return a URL for a Convex storage file. Use for post images (imageStorageId).
 */
export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})
