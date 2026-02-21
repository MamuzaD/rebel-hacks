/**
 * Vegas-themed challenge prompts. One is chosen at random each day for the round.
 */
export const ROUND_PROMPTS = [
  "What's your most overrated Vegas moment?",
  "What's the one spot you'd never tell tourists about?",
  'Best local spot in town. No tourists, no lines — prove it.',
  'Most overrated Vegas moment? Fight me.',
  'Your best local secret. Go.',
  'Something that only a Vegas local would know.',
  'The most underrated thing to do in Vegas.',
  'Your go-to spot when you want to avoid the strip.',
  "Best Vegas moment that didn't cost a dime.",
  'What would you tell a tourist to skip?',
] as const

export function pickRandomPrompt(): string {
  const i = Math.floor(Math.random() * ROUND_PROMPTS.length)
  return ROUND_PROMPTS[i]
}
