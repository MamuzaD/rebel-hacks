/**
 * Centralized betting logic for Truth or Bluff game
 */

// Betting boundaries
export const MIN_CHIP_AMOUNT = 5
export const MAX_CHIP_AMOUNT = 1000
export const CHIP_STEP = 5

// Default betting amounts
export const DEFAULT_CHIP_AMOUNT = 25
export const DEFAULT_VOTE_AMOUNT = 0.5

// Available betting options
export const CHIP_OPTIONS = Array.from(
  { length: (MAX_CHIP_AMOUNT - MIN_CHIP_AMOUNT) / CHIP_STEP + 1 },
  (_, index) => MIN_CHIP_AMOUNT + index * CHIP_STEP,
) as readonly number[]
export const VOTE_AMOUNT_OPTIONS = [0.5, 1, 2, 5, 10] as const

export type ChipOption = number
export type VoteAmountOption = (typeof VOTE_AMOUNT_OPTIONS)[number]

/**
 * Validates if a chip amount is valid
 */
export function isValidChipAmount(amount: number): amount is ChipOption {
  return (
    amount >= MIN_CHIP_AMOUNT &&
    amount <= MAX_CHIP_AMOUNT &&
    Number.isInteger(amount) &&
    (amount - MIN_CHIP_AMOUNT) % CHIP_STEP === 0
  )
}

/**
 * Validates if a vote amount is valid
 */
export function isValidVoteAmount(amount: number): amount is VoteAmountOption {
  return VOTE_AMOUNT_OPTIONS.includes(amount as VoteAmountOption)
}

/**
 * Gets the closest valid chip amount (rounds up)
 */
export function getClosestChipAmount(amount: number): ChipOption {
  if (amount <= MIN_CHIP_AMOUNT) return MIN_CHIP_AMOUNT
  if (amount >= MAX_CHIP_AMOUNT) return MAX_CHIP_AMOUNT
  const relative = amount - MIN_CHIP_AMOUNT
  const lower = MIN_CHIP_AMOUNT + Math.floor(relative / CHIP_STEP) * CHIP_STEP
  const upper = Math.min(lower + CHIP_STEP, MAX_CHIP_AMOUNT)
  return amount - lower <= upper - amount ? lower : upper
}

/**
 * Gets the closest valid vote amount (rounds up)
 */
export function getClosestVoteAmount(amount: number): VoteAmountOption {
  if (amount <= VOTE_AMOUNT_OPTIONS[0]) return VOTE_AMOUNT_OPTIONS[0]
  if (amount >= VOTE_AMOUNT_OPTIONS[VOTE_AMOUNT_OPTIONS.length - 1])
    return VOTE_AMOUNT_OPTIONS[VOTE_AMOUNT_OPTIONS.length - 1]

  for (let i = 0; i < VOTE_AMOUNT_OPTIONS.length - 1; i++) {
    if (amount <= VOTE_AMOUNT_OPTIONS[i + 1]) {
      return amount - VOTE_AMOUNT_OPTIONS[i] <= VOTE_AMOUNT_OPTIONS[i + 1] - amount
        ? VOTE_AMOUNT_OPTIONS[i]
        : VOTE_AMOUNT_OPTIONS[i + 1]
    }
  }

  return VOTE_AMOUNT_OPTIONS[VOTE_AMOUNT_OPTIONS.length - 1]
}

/**
 * Betting error messages
 */
export const BETTING_ERRORS = {
  INSUFFICIENT_CHIPS: 'Insufficient chips. You can only bet what you have.',
  INVALID_AMOUNT: 'Invalid betting amount.',
  NEGATIVE_WAGER: 'Wager must be positive.',
  ALREADY_VOTED: 'Already voted on this post.',
  OWN_POST: "You can't vote on your own post.",
  VOTING_CLOSED: 'Voting closed for this post.',
  OUTSIDE_POSTING_WINDOW: 'Posting is currently closed for this challenge.',
  ALREADY_POSTED: 'You already posted for this prompt.',
  MISSING_IMAGE: 'Please choose an image before posting.',
  IMAGE_UPLOAD_FAILED: 'Your image upload failed, so the post was not created. Please try again.',
} as const

/**
 * Helper to format chip amounts with proper pluralization
 */
export function formatChips(amount: number): string {
  return `${amount} chip${amount === 1 ? '' : 's'}`
}

/**
 * Helper to get the default amount based on context
 */
export function getDefaultAmount(context: 'post' | 'vote' | 'swipe'): number {
  switch (context) {
    case 'post':
      return DEFAULT_CHIP_AMOUNT
    case 'vote':
      return DEFAULT_VOTE_AMOUNT
    case 'swipe':
      return DEFAULT_CHIP_AMOUNT // 25 chips for swipe actions
    default:
      return DEFAULT_CHIP_AMOUNT
  }
}

/**
 * Helper to get available options based on context
 */
export function getBettingOptions(context: 'post' | 'vote'): readonly number[] {
  switch (context) {
    case 'post':
      return CHIP_OPTIONS
    case 'vote':
      return VOTE_AMOUNT_OPTIONS
    default:
      return CHIP_OPTIONS
  }
}

/**
 * Gets chip options constrained by current balance.
 */
export function getChipOptionsForBalance(balance: number | null | undefined): readonly number[] {
  if (balance == null || Number.isNaN(balance)) return CHIP_OPTIONS
  const cappedBalance = Math.max(0, Math.min(balance, MAX_CHIP_AMOUNT))
  return CHIP_OPTIONS.filter((amount) => amount <= cappedBalance)
}
