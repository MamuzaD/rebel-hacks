/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as comments from "../comments.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as friendships from "../friendships.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_prompts from "../lib/prompts.js";
import type * as lib_roundSchedule from "../lib/roundSchedule.js";
import type * as lib_settlement from "../lib/settlement.js";
import type * as lib_statusLine from "../lib/statusLine.js";
import type * as lib_validators from "../lib/validators.js";
import type * as posts from "../posts.js";
import type * as prompts from "../prompts.js";
import type * as reactions from "../reactions.js";
import type * as reveal from "../reveal.js";
import type * as seed from "../seed.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  comments: typeof comments;
  crons: typeof crons;
  files: typeof files;
  friendships: typeof friendships;
  leaderboard: typeof leaderboard;
  "lib/auth": typeof lib_auth;
  "lib/prompts": typeof lib_prompts;
  "lib/roundSchedule": typeof lib_roundSchedule;
  "lib/settlement": typeof lib_settlement;
  "lib/statusLine": typeof lib_statusLine;
  "lib/validators": typeof lib_validators;
  posts: typeof posts;
  prompts: typeof prompts;
  reactions: typeof reactions;
  reveal: typeof reveal;
  seed: typeof seed;
  transactions: typeof transactions;
  users: typeof users;
  votes: typeof votes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
