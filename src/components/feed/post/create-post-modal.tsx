import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { NumberStepper } from '@/components/ui/number-stepper'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { useUser } from '@/hooks/use-user'
import { CHIP_OPTIONS, DEFAULT_CHIP_AMOUNT, MIN_CHIP_AMOUNT } from '@/lib/betting'
import { getRoundCyclePhase } from '@/lib/round-status'
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from 'convex/react'
import { CameraIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type CreatePostModalProps = {
  prompt: Doc<'prompts'> | null
  isSignedIn: boolean
  hasPostedForPrompt: boolean
  compact?: boolean
}

const REQUEST_ID_PATTERN = /\[Request ID:\s*([^\]]+)\]/i

function getPostCreateErrorFeedback(error: unknown): {
  description: string
  requestId?: string
} {
  const fallbackDescription = 'Your post could not be created. Please try again in a moment.'
  const rawMessage = error instanceof Error ? error.message : String(error ?? '')
  const requestId = rawMessage.match(REQUEST_ID_PATTERN)?.[1]
  const convexMessageMatch = rawMessage.match(
    /Uncaught Error:\s*(.*?)(?:\s+at handler|\s+Called by client|$)/i,
  )
  const compactMessage =
    convexMessageMatch?.[1]?.trim() ||
    rawMessage
      .replace(/\[CONVEX [^\]]+\]/g, '')
      .replace(/\[Request ID:[^\]]+\]/gi, '')
      .trim()

  if (/insufficient chips/i.test(compactMessage)) {
    return {
      description:
        'Your bet is higher than your current chip balance. Lower the chips and try again.',
      requestId,
    }
  }
  if (/already posted/i.test(compactMessage)) {
    return {
      description: 'You already posted for this challenge.',
      requestId,
    }
  }
  if (/outside posting window|posting has not opened/i.test(compactMessage)) {
    return {
      description: 'Posting is currently closed for this challenge.',
      requestId,
    }
  }
  if (/image upload failed/i.test(compactMessage)) {
    return {
      description: 'Your image upload failed, so the post was not created. Please try again.',
      requestId,
    }
  }

  return {
    description: compactMessage || fallbackDescription,
    requestId,
  }
}

export function CreatePostModal({
  prompt,
  isSignedIn,
  hasPostedForPrompt,
  compact,
}: CreatePostModalProps) {
  const { user: currentUser } = useUser()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadUrl = useMutation(api.files.generateUploadUrl)
  const createPost = useMutation(api.posts.create)
  const roundCycle =
    prompt != null
      ? getRoundCyclePhase(
          Date.now(),
          prompt.postWindowStart,
          prompt.postWindowEnd,
          prompt.revealTime,
        )
      : null

  const form = useForm({
    defaultValues: {
      caption: '',
      isTruth: 'truth' as 'truth' | 'bluff',
      chips: DEFAULT_CHIP_AMOUNT,
      imageFile: null as File | null,
    },
    onSubmit: async ({ value }) => {
      if (!prompt) {
        toast.error('Could not create post', {
          description: 'There is no active prompt yet.',
        })
        return
      }
      if (roundCycle !== 'posting') {
        toast.error('Could not create post', {
          description: 'Posting has not opened yet.',
        })
        return
      }

      if (!value.imageFile) {
        toast.error('Could not create post', {
          description: 'Please choose an image before posting.',
        })
        return
      }

      const postUrl = await uploadUrl({})
      const uploadResult = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': value.imageFile.type },
        body: value.imageFile,
      })
      if (!uploadResult.ok) {
        throw new Error('Image upload failed')
      }
      const { storageId } = (await uploadResult.json()) as {
        storageId: Id<'_storage'>
      }

      await createPost({
        promptId: prompt._id,
        imageStorageId: storageId,
        caption: value.caption.trim() || undefined,
        isTruth: value.isTruth === 'truth',
        chipPot: value.chips,
      })

      // Feed is fetched with TanStack infinite query + convex.query,
      // so explicitly invalidate to show the new post immediately.
      await queryClient.invalidateQueries({ queryKey: ['feedPosts'] })

      form.reset()
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return null
      })
      setOpen(false)
      toast.success('Post created', {
        description: 'Your post is now live in the feed.',
      })
    },
  })

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const disabledReason = !isSignedIn
    ? 'Sign in to post.'
    : currentUser != null && currentUser.chipBalance < MIN_CHIP_AMOUNT
      ? `You need at least ${MIN_CHIP_AMOUNT} chips to post.`
      : !prompt
        ? 'No active prompt yet.'
        : hasPostedForPrompt
          ? 'You already posted for this prompt.'
          : roundCycle !== 'posting'
            ? 'Posting has not opened yet.'
            : null

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && disabledReason != null) return
        setOpen(nextOpen)
      }}
    >
      {compact ? (
        <Tooltip>
          <TooltipTrigger>
            <span className="shrink-0 inline-flex">
              <DialogTrigger
                disabled={disabledReason != null}
                render={
                  <Button
                    size="icon"
                    variant={disabledReason != null ? 'ghost' : 'default'}
                    className="size-9 rounded-full pointer-events-auto"
                    disabled={disabledReason != null}
                  />
                }
              >
                <CameraIcon className="size-4" />
              </DialogTrigger>
            </span>
          </TooltipTrigger>
          {disabledReason != null && (
            <TooltipContent side="bottom">{disabledReason}</TooltipContent>
          )}
        </Tooltip>
      ) : (
        <DialogTrigger
          disabled={disabledReason != null}
          render={<Button size="lg" className="w-full" disabled={disabledReason != null} />}
        >
          {disabledReason ?? 'Create post'}
        </DialogTrigger>
      )}

      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {/* ── Header (pinned) ── */}
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border/60 px-6 pt-6 pb-4">
          <DialogTitle>Post to today&apos;s challenge</DialogTitle>
          <DialogDescription>
            Your truth/bluff choice stays hidden until reveal.
            {prompt && (
              <div className="mt-2 relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/60">
                  Today&apos;s prompt
                </p>
                <p className="mt-1 font-medium leading-snug">{prompt.prompt}</p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <form
          action="#"
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit().catch((error) => {
              const { description, requestId } = getPostCreateErrorFeedback(error)
              toast.error('Could not create post', {
                description: requestId ? `${description} (Request ID: ${requestId})` : description,
              })
            })
          }}
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* ── Prompt card ── */}

            {/* ── Photo upload ── */}
            <form.Field
              name="imageFile"
              validators={{
                onSubmit: ({ value }) => (value == null ? 'A photo is required' : undefined),
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Photo</FieldLabel>
                  <FieldContent>
                    <label
                      htmlFor={field.name}
                      className={cn(
                        'group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors',
                        previewUrl
                          ? 'border-transparent'
                          : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50',
                      )}
                    >
                      {previewUrl ? (
                        <div className="relative mx-auto aspect-square w-full max-h-48 max-w-48">
                          <img
                            src={previewUrl}
                            alt="Selected upload preview"
                            className="absolute inset-0 size-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-black">
                              Change photo
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-8">
                          <CameraIcon className="size-8 text-muted-foreground/60" />
                          <span className="text-sm text-muted-foreground">Tap to add a photo</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        id={field.name}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const nextFile = event.target.files?.[0] ?? null
                          field.handleChange(nextFile)
                          setPreviewUrl((previous) => {
                            if (previous) URL.revokeObjectURL(previous)
                            return nextFile ? URL.createObjectURL(nextFile) : null
                          })
                        }}
                      />
                    </label>
                    {field.state.meta.errors[0] && (
                      <FieldError>{String(field.state.meta.errors[0])}</FieldError>
                    )}
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            {/* ── Caption (optional contextual evidence) ── */}
            <form.Field name="caption">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Caption <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Set the scene or add context..."
                      rows={2}
                    />
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            {/* ── Truth / Bluff + chips (default 25, ± to adjust) ── */}
            <form.Field name="isTruth">
              {(fieldIsTruth) => (
                <form.Field name="chips">
                  {(fieldChips) => {
                    const chips = fieldChips.state.value
                    return (
                      <Field>
                        <FieldLabel id={`truth-or-bluff-label-${prompt?._id ?? 'active'}`}>
                          Truth or bluff?
                        </FieldLabel>
                        <FieldContent>
                          <div
                            role="group"
                            aria-labelledby={`truth-or-bluff-label-${prompt?._id ?? 'active'}`}
                            className="grid grid-cols-2 gap-3"
                          >
                            <NumberStepper
                              value={chips}
                              options={CHIP_OPTIONS}
                              onChange={fieldChips.handleChange}
                              decrementLabel="Decrease bet"
                              incrementLabel="Increase bet"
                              className={cn(
                                'rounded-xl border-2 px-2 py-3 transition-all',
                                fieldIsTruth.state.value === 'truth'
                                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'border-border text-muted-foreground hover:border-muted-foreground/40',
                              )}
                            >
                              <button
                                type="button"
                                className="flex w-full items-center justify-center gap-2 text-sm font-medium"
                                onClick={() => fieldIsTruth.handleChange('truth')}
                              >
                                <span className="text-base" aria-hidden>
                                  ✅
                                </span>
                                Truth
                                <span className="text-xs opacity-80">{chips}</span>
                              </button>
                            </NumberStepper>
                            <NumberStepper
                              value={chips}
                              options={CHIP_OPTIONS}
                              onChange={fieldChips.handleChange}
                              decrementLabel="Decrease bet"
                              incrementLabel="Increase bet"
                              className={cn(
                                'rounded-xl border-2 px-2 py-3 transition-all',
                                fieldIsTruth.state.value === 'bluff'
                                  ? 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400'
                                  : 'border-border text-muted-foreground hover:border-muted-foreground/40',
                              )}
                            >
                              <button
                                type="button"
                                className="flex w-full items-center justify-center gap-2 text-sm font-medium"
                                onClick={() => fieldIsTruth.handleChange('bluff')}
                              >
                                <span className="text-base" aria-hidden>
                                  🃏
                                </span>
                                Bluff
                                <span className="text-xs opacity-80">{chips}</span>
                              </button>
                            </NumberStepper>
                          </div>
                        </FieldContent>
                      </Field>
                    )
                  }}
                </form.Field>
              )}
            </form.Field>
          </div>

          {/* ── Footer (pinned) ── */}
          <div className="shrink-0 border-t border-border/60 px-6 py-4">
            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Posting…' : 'Post'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
