import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { CoinsIcon, HistoryIcon, TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { api } from '@/convex/_generated/api'
import { useUser } from '@/hooks/use-user'
import { timeAgo } from '@/lib/time'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/history')({
  component: HistoryPage,
})

type TxReason =
  | 'post_stake'
  | 'vote_stake'
  | 'vote_correct'
  | 'vote_incorrect'
  | 'bluff_fooled'
  | 'all_in_bonus'
  | 'receipts_bonus'

function formatTxLabel(
  reason: TxReason,
  amount: number,
  opts: {
    myGuess?: 'truth' | 'bluff'
    wager?: number
    actual?: 'truth' | 'bluff'
    isRevealed?: boolean
  },
): string {
  const abs = Math.abs(amount)
  switch (reason) {
    case 'post_stake':
      return `Staked ${abs} chips on your post`
    case 'vote_stake':
      return opts.isRevealed
        ? `Bet ${abs} on ${opts.myGuess === 'truth' ? 'Truth' : 'Bluff'}`
        : `Bet ${abs} on ${opts.myGuess === 'truth' ? 'Truth' : 'Bluff'} (pending)`
    case 'vote_correct':
      return opts.isRevealed
        ? `Correct — it was ${opts.actual === 'truth' ? 'Truth' : 'Bluff'}. Won ${abs} chips`
        : `Won ${abs} chips`
    case 'vote_incorrect':
      return opts.isRevealed
        ? `Wrong — it was ${opts.actual === 'truth' ? 'Truth' : 'Bluff'}. Lost ${opts.wager ?? abs} chips`
        : `Lost ${abs} chips`
    case 'bluff_fooled':
      return `Bluff bonus: +${abs} chips`
    case 'all_in_bonus':
      return `All-in bonus: +${abs} chips`
    case 'receipts_bonus':
      return `Receipts bonus: +${abs} chips`
    default:
      return amount >= 0 ? `+${amount} chips` : `${amount} chips`
  }
}

function HistoryPage() {
  const { user: currentUser } = useUser()
  const transactions = useQuery(
    api.transactions.listMyTransactions,
    currentUser != null ? { limit: 100 } : 'skip',
  )

  if (currentUser == null) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card/50 p-8 text-center">
        <HistoryIcon className="size-12 text-muted-foreground/60" />
        <p className="text-muted-foreground">Sign in to see your history.</p>
      </div>
    )
  }

  if (transactions === undefined) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/50" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`transaction-skeleton-${i}`}
              className="h-24 animate-pulse rounded-2xl bg-muted/30"
            />
          ))}
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight md:text-3xl">History</h1>
          <p className="mt-1 text-muted-foreground">
            Your chip bets and outcomes will appear here.
          </p>
        </div>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <CoinsIcon className="size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            No history yet. Post or vote on the feed to start.
          </p>
        </div>
      </div>
    )
  }

  const groupedByDate = transactions.reduce<Record<string, typeof transactions>>((acc, tx) => {
    const key = tx.postDate ?? new Date(tx.transactionDate).toISOString().slice(0, 10)
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {})
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-sans text-2xl font-semibold tracking-tight md:text-3xl">History</h1>
        <p className="text-muted-foreground">Full history of your bets and outcomes.</p>
      </div>

      <div className="space-y-6">
        {sortedDates.map((dateKey) => {
          const txs = groupedByDate[dateKey]
          const dateLabel =
            dateKey === new Date().toISOString().slice(0, 10)
              ? 'Today'
              : new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year:
                    dateKey.slice(0, 4) !== new Date().getFullYear().toString()
                      ? 'numeric'
                      : undefined,
                })
          return (
            <section key={dateKey} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dateLabel}
                </span>
                <Separator className="flex-1" />
              </div>
              <ul className="space-y-3">
                {txs.map((tx) => {
                  const isCredit = tx.amount > 0
                  const isPendingVoteStake = tx.reason === 'vote_stake' && tx.isRevealed !== true
                  const label = formatTxLabel(tx.reason as TxReason, tx.amount, {
                    myGuess: tx.myGuess,
                    wager: tx.wager,
                    actual: tx.actual,
                    isRevealed: tx.isRevealed,
                  })
                  return (
                    <li key={tx._id}>
                      <Card
                        size="sm"
                        className={cn(
                          'overflow-hidden transition-colors',
                          isPendingVoteStake &&
                            'border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10',
                          !isPendingVoteStake &&
                            isCredit &&
                            'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10',
                          !isPendingVoteStake &&
                            !isCredit &&
                            tx.amount < 0 &&
                            'border-destructive/20 bg-destructive/5 dark:bg-destructive/10',
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <CardTitle className="text-sm font-medium leading-snug">
                              {label}
                            </CardTitle>
                            {isPendingVoteStake ? (
                              <Badge
                                variant="secondary"
                                className="shrink-0 font-semibold text-amber-700 dark:text-amber-400"
                              >
                                Pending
                              </Badge>
                            ) : (
                              <span
                                className={cn(
                                  'inline-flex shrink-0 items-center gap-1 tabular-nums font-semibold',
                                  isCredit
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-destructive',
                                )}
                              >
                                {isCredit ? (
                                  <TrendingUp className="size-4" />
                                ) : (
                                  <TrendingDown className="size-4" />
                                )}
                                {isCredit ? '+' : ''}
                                {tx.amount}
                              </span>
                            )}
                          </div>
                          {(tx.promptText || tx.postCaption) && (
                            <CardDescription className="mt-1.5 line-clamp-2 text-xs">
                              {tx.promptText && (
                                <span className="font-medium text-muted-foreground">
                                  {tx.promptText}
                                  {tx.postCaption ? ' · ' : ''}
                                </span>
                              )}
                              {tx.postCaption && (
                                <span className="italic">&ldquo;{tx.postCaption}&rdquo;</span>
                              )}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {tx.reason.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(tx.transactionDate)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
