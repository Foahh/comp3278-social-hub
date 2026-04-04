import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { ChevronLeft, ChevronRight } from "pixelarticons/react"
import { Comment } from "pixelarticons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
import { Button } from "@/components/ui/8bit/button"
import { LinkButton } from "@/components/ui/8bit/link-button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/8bit/card"
import { Progress } from "@/components/ui/8bit/progress"
import { Spinner } from "@/components/ui/8bit/spinner"
import { LikeButton } from "./LikeButton"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import type { components } from "@/lib/api/schema"
import { parseApiDate } from "@/lib/datetime"

type PostResponse = components["schemas"]["PostResponse"]

/** Muted pad around the retro frame (matches non-fallback carousel chrome). */
const carouselImageOuter =
  "flex w-max max-w-full items-center justify-center bg-muted/40 p-1"

/** Same border / shadow as post images; inner box sizes to content (text or image). */
const carouselImageFrame =
  "box-border border-2 border-foreground/20 bg-card shadow-[3px_3px_0_0_var(--foreground)] dark:border-ring/40 dark:shadow-[3px_3px_0_0_var(--ring)]"

function PostCarouselImage({
  url,
  onLoaded,
}: {
  url: string
  onLoaded: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={carouselImageOuter}>
        <div
          className={cn(
            carouselImageFrame,
            "flex w-max max-w-full items-center justify-center px-3 py-2.5"
          )}
        >
          <p aria-label={url} className="text-sm text-muted-foreground">
            Image unavailable
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={carouselImageOuter}>
      <div
        className={cn(
          carouselImageFrame,
          "relative flex min-h-48 w-max max-w-full items-center justify-center",
          !loaded && "min-w-[12em]"
        )}
      >
        {!loaded && (
          <div className="absolute inset-2 z-0 flex items-center justify-center bg-card">
            <Spinner
              variant="diamond"
              className="size-8 text-muted-foreground"
            />
          </div>
        )}
        <img
          src={url}
          alt=""
          className={cn(
            "relative z-10 block max-h-72 w-auto max-w-full object-contain transition-opacity duration-150",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => {
            setLoaded(true)
            onLoaded()
          }}
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  )
}

function PostImagesCarousel({
  images,
  imageLoadFallback,
}: {
  images: PostResponse["images"]
  imageLoadFallback: boolean
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [snapCount, setSnapCount] = useState(images.length)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [scrollProgressPercent, setScrollProgressPercent] = useState(0)

  const updateFromApi = useCallback((instance: CarouselApi | undefined) => {
    if (!instance) return
    setSnapCount(instance.scrollSnapList().length)
    setCanScrollPrev(instance.canScrollPrev())
    setCanScrollNext(instance.canScrollNext())
  }, [])

  const syncScrollProgress = useCallback(
    (instance: CarouselApi | undefined) => {
      if (!instance) return
      const snaps = instance.scrollSnapList().length
      if (snaps <= 1) {
        setScrollProgressPercent(100)
        return
      }
      setScrollProgressPercent(instance.scrollProgress() * 100)
    },
    []
  )

  useEffect(() => {
    if (!api) return
    const syncNav = () => updateFromApi(api)
    const syncProgress = () => syncScrollProgress(api)
    const syncAll = () => {
      syncNav()
      syncProgress()
    }
    syncAll()
    api.on("select", syncAll)
    api.on("reInit", syncAll)
    api.on("scroll", syncProgress)
    return () => {
      api.off("select", syncAll)
      api.off("reInit", syncAll)
      api.off("scroll", syncProgress)
    }
  }, [api, updateFromApi, syncScrollProgress])

  const onImageLoad = useCallback(() => {
    api?.reInit()
  }, [api])

  const progressBarRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const seekToFraction = useCallback(
    (clientX: number) => {
      if (!api || !progressBarRef.current) return
      const rect = progressBarRef.current.getBoundingClientRect()
      const fraction = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      )
      const snaps = api.scrollSnapList()
      if (snaps.length <= 1) return
      const index = Math.round(fraction * (snaps.length - 1))
      api.scrollTo(index)
    },
    [api]
  )

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      isDraggingRef.current = true
      setIsDragging(true)
      seekToFraction(e.clientX)

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDraggingRef.current) return
        seekToFraction(ev.clientX)
      }
      const onMouseUp = () => {
        isDraggingRef.current = false
        setIsDragging(false)
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
      }
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    },
    [seekToFraction]
  )

  const handleProgressTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      if (!touch) return
      isDraggingRef.current = true
      setIsDragging(true)
      seekToFraction(touch.clientX)

      const onTouchMove = (ev: TouchEvent) => {
        if (!isDraggingRef.current) return
        const t = ev.touches[0]
        if (t) seekToFraction(t.clientX)
      }
      const onTouchEnd = () => {
        isDraggingRef.current = false
        setIsDragging(false)
        window.removeEventListener("touchmove", onTouchMove)
        window.removeEventListener("touchend", onTouchEnd)
      }
      window.addEventListener("touchmove", onTouchMove, { passive: true })
      window.addEventListener("touchend", onTouchEnd)
    },
    [seekToFraction]
  )

  const progressLabel =
    snapCount > 0
      ? `${Math.round(Math.max(0, Math.min(scrollProgressPercent, 100)))}%`
      : ""

  return (
    <div className="space-y-3">
      <Carousel setApi={setApi} className="w-full" opts={{ align: "start" }}>
        <CarouselContent className="-ml-2">
          {images.map((img) => (
            <CarouselItem
              key={img.image_id}
              className="max-w-full shrink-0 grow-0 basis-auto pl-2"
            >
              {imageLoadFallback ? (
                <PostCarouselImage url={img.url} onLoaded={onImageLoad} />
              ) : (
                <div className={carouselImageOuter}>
                  <div
                    className={cn(
                      carouselImageFrame,
                      "flex w-max max-w-full items-center justify-center"
                    )}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="block max-h-72 w-auto max-w-full object-contain"
                      onLoad={onImageLoad}
                    />
                  </div>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center gap-3">
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={!canScrollPrev}
            onClick={() => api?.scrollPrev()}
            aria-label="Previous image"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={!canScrollNext}
            onClick={() => api?.scrollNext()}
            aria-label="Next image"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div
          ref={progressBarRef}
          className={cn(
            "min-w-0 flex-1 touch-none select-none",
            snapCount > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-pointer"
              : "cursor-default"
          )}
          onMouseDown={snapCount > 1 ? handleProgressMouseDown : undefined}
          onTouchStart={snapCount > 1 ? handleProgressTouchStart : undefined}
          role="slider"
          aria-label={
            snapCount > 0
              ? `Carousel scroll position, ${progressLabel}`
              : "Carousel scroll position"
          }
          aria-valuenow={Math.round(
            Math.max(0, Math.min(scrollProgressPercent, 100))
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={snapCount > 0 ? progressLabel : undefined}
          tabIndex={snapCount > 1 ? 0 : undefined}
          onKeyDown={
            snapCount > 1
              ? (e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault()
                    api?.scrollPrev()
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault()
                    api?.scrollNext()
                  }
                }
              : undefined
          }
        >
          <Progress
            variant="retro"
            value={scrollProgressPercent}
            max={100}
            className="pointer-events-none h-3"
          />
        </div>
        <span className="w-10 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
          {progressLabel}
        </span>
      </div>
    </div>
  )
}

export function PostCard({
  post,
  hidePostLink = false,
  imageLoadFallback = true,
  disableLink = false,
}: {
  post: PostResponse
  /** When true, hides the comment-count link to the post (e.g. on the post detail page). */
  hidePostLink?: boolean
  /** Diamond spinner while loading and a message if the image fails. */
  imageLoadFallback?: boolean
  /** When true, avatar and author line are not links (e.g. on `/user/$username`). */
  disableLink?: boolean
}) {
  const createdAt = parseApiDate(post.created_at)
  const commentLabel =
    post.comment_count === 0
      ? "View post and comments"
      : post.comment_count === 1
        ? "View post (1 comment)"
        : `View post (${post.comment_count} comments)`

  const avatar = (
    <Avatar className="size-10">
      {post.avatar_url && <AvatarImage src={post.avatar_url} alt={post.name} />}
      <AvatarFallback>{post.name[0]?.toUpperCase() ?? "?"}</AvatarFallback>
    </Avatar>
  )

  const authorLine = (
    <>
      <span className="font-medium">{post.name}</span>{" "}
      <span className="font-normal text-muted-foreground">
        @{post.username}
      </span>
    </>
  )

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 border-b border-border pb-4">
        {disableLink ? (
          <div className="shrink-0">{avatar}</div>
        ) : (
          <Link
            to="/user/$username"
            params={{ username: post.username }}
            className="shrink-0 rounded-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {avatar}
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {disableLink ? (
            <div className="block truncate text-left">{authorLine}</div>
          ) : (
            <Link
              to="/user/$username"
              params={{ username: post.username }}
              className="block truncate rounded-sm text-left ring-offset-background transition-colors outline-none hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {authorLine}
            </Link>
          )}
          <p
            className="text-xs text-muted-foreground"
            title={createdAt.toLocaleString()}
          >
            {formatDistanceToNow(createdAt, {
              addSuffix: true,
            })}
          </p>
        </div>
      </CardHeader>

      {post.text_content && (
        <CardContent className="pt-0 pb-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-card-foreground">
            {post.text_content}
          </p>
        </CardContent>
      )}

      {post.images.length > 0 && (
        <div className="px-6 pb-2">
          <PostImagesCarousel
            images={post.images}
            imageLoadFallback={imageLoadFallback}
          />
        </div>
      )}

      <CardFooter className="border-t">
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <LikeButton post={post} />
          {!hidePostLink && (
            <LinkButton
              to="/post/$id"
              params={{ id: String(post.post_id) }}
              variant="secondary"
              size="sm"
              className="min-w-16 whitespace-nowrap"
              aria-label={commentLabel}
            >
              <Comment className="size-4 shrink-0" aria-hidden />
              <span className="text-xs tabular-nums">{post.comment_count}</span>
            </LinkButton>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
