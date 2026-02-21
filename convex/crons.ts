import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval('run reveal settlement', { minutes: 5 }, internal.reveal.runSettlement)

// Run once daily to choose today's random round start time.
crons.daily('ensure today round', { hourUTC: 8, minuteUTC: 0 }, internal.prompts.ensureTodayRound)

export default crons
