import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
] as const

export type ReactionType = (typeof REACTIONS)[number]['type']

type ReactionsProps = {
  reactionCounts?: Partial<Record<ReactionType, number>>
  myReaction?: ReactionType | null
  canReact: boolean
  postId?: string
  onReact?: (postId: string, reactionType: ReactionType) => void
}

export function Reactions({
  reactionCounts,
  myReaction,
  canReact,
  postId,
  onReact,
}: ReactionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTIONS.map((reaction) => (
        <Tooltip key={reaction.type}>
          <TooltipTrigger>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={!canReact}
              onClick={() => canReact && postId && onReact?.(postId, reaction.type)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] active:scale-[0.97]',
                myReaction === reaction.type
                  ? 'border-primary/35 bg-primary/15 text-foreground'
                  : 'border-border bg-muted text-muted-foreground',
              )}
              aria-label={`${reaction.label} reaction`}
            >
              <span>{reaction.emoji}</span>
              {(reactionCounts?.[reaction.type] ?? 0) > 0 && (
                <span>{reactionCounts?.[reaction.type]}</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{reaction.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
