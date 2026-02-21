import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  chipReason,
  friendshipStatus,
  reactionType,
  voteGuess,
} from './lib/validators'

export default defineSchema({
  users: defineTable({
    // basic auth
    clerkUserId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    // chips
    chipBalance: v.number(),
    totalChipsEarned: v.optional(v.number()),
    bluffWinRate: v.optional(v.number()),
    readAccuracy: v.optional(v.number()),
    biggestPot: v.optional(v.number()),
  })
    .index('clerkUserId', ['clerkUserId'])
    .index('username', ['username']),

  posts: defineTable({
    authorId: v.id('users'),
    promptId: v.id('prompts'),
    imageStorageId: v.id('_storage'),
    caption: v.optional(v.string()),
    actual: voteGuess,
    isRevealed: v.boolean(),
    revealedAt: v.optional(v.number()),
    postDate: v.string(),
    chipPot: v.optional(v.number()),
  })
    .index('authorId', ['authorId'])
    .index('promptId', ['promptId'])
    .index('authorId_promptId', ['authorId', 'promptId'])
    .index('postDate', ['postDate'])
    .index('isRevealed', ['isRevealed'])
    .index('authorId_postDate', ['authorId', 'postDate']),

  prompts: defineTable({
    prompt: v.string(),
    date: v.string(),
    postWindowStart: v.number(),
    postWindowEnd: v.number(),
    revealTime: v.number(),
  }).index('date', ['date']),

  votes: defineTable({
    userId: v.id('users'),
    postId: v.id('posts'),
    guess: voteGuess,
    wager: v.optional(v.number()),
    chipsWon: v.optional(v.number()),
    votedAt: v.number(),
  })
    .index('userId', ['userId'])
    .index('postId', ['postId'])
    .index('userId_postId', ['userId', 'postId'])
    .index('postId_guess', ['postId', 'guess']),

  reactions: defineTable({
    userId: v.id('users'),
    postId: v.id('posts'),
    reactionType,
    reactedAt: v.number(),
  })
    .index('postId', ['postId'])
    .index('userId_postId', ['userId', 'postId'])
    .index('postId_reactionType', ['postId', 'reactionType']),

  comments: defineTable({
    postId: v.id('posts'),
    userId: v.id('users'),
    parentId: v.optional(v.id('comments')),
    text: v.string(),
    createdAt: v.number(),
  })
    .index('postId', ['postId'])
    .index('postId_createdAt', ['postId', 'createdAt'])
    .index('userId', ['userId'])
    .index('parentId', ['parentId']),

  chipTransactions: defineTable({
    userId: v.id('users'),
    postId: v.optional(v.id('posts')),
    voteId: v.optional(v.id('votes')),
    amount: v.number(),
    reason: chipReason,
    transactionDate: v.number(),
  })
    .index('userId', ['userId'])
    .index('postId', ['postId'])
    .index('voteId', ['voteId'])
    .index('userId_transactionDate', ['userId', 'transactionDate']),

  friendships: defineTable({
    requesterId: v.id('users'),
    addresseeId: v.id('users'),
    status: friendshipStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('requesterId', ['requesterId'])
    .index('addresseeId', ['addresseeId'])
    .index('requesterId_addresseeId', ['requesterId', 'addresseeId'])
    .index('addresseeId_status', ['addresseeId', 'status']),
})
