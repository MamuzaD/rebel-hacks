export const REVEAL_SUCCESS_MESSAGES = [
  'You read it right',
  'Nailed it',
  'Sharp eye',
  'Called it',
  'You saw through it',
  'Truth detector on point',
  'No bluffing you',
  'Spot on',
  'You got it',
  'Right call',
] as const

export const REVEAL_FAILURE_MESSAGES = [
  'You got played',
  'Fooled ya',
  'Nice try',
  'Almost had it',
  'They got you',
  'Bluffed',
  'Next time',
  'Smooth one',
  'Better luck next round',
  'Oof',
] as const

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomRevealSuccessMessage(): string {
  return randomItem(REVEAL_SUCCESS_MESSAGES)
}

export function randomRevealFailureMessage(): string {
  return randomItem(REVEAL_FAILURE_MESSAGES)
}
