import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Comment } from "pixelarticons/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar";
import { Button } from "@/components/ui/8bit/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/8bit/card";
import { LikeButton } from "./LikeButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { components } from "@/lib/api/schema";

type PostResponse = components["schemas"]["PostResponse"];

function PostImagesCarousel({
  images,
}: {
  images: PostResponse["images"];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(images.length);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateFromApi = useCallback((instance: CarouselApi | undefined) => {
    if (!instance) return;
    setSnapCount(instance.scrollSnapList().length);
    setSelectedSnap(instance.selectedScrollSnap());
    setCanScrollPrev(instance.canScrollPrev());
    setCanScrollNext(instance.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    const sync = () => updateFromApi(api);
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api, updateFromApi]);

  const onImageLoad = useCallback(() => {
    api?.reInit();
  }, [api]);

  return (
    <div className="space-y-2">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{ align: "start" }}
      >
        <CarouselContent className="-ml-2">
          {images.map((img) => (
            <CarouselItem
              key={img.image_id}
              className="max-w-full shrink-0 grow-0 basis-auto pl-2"
            >
              <div className="flex min-h-48 w-max max-w-full items-center justify-center rounded-md bg-muted/30">
                <img
                  src={img.url}
                  alt=""
                  className="block max-h-72 w-auto max-w-full object-contain"
                  onLoad={onImageLoad}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="flex gap-1.5">
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
        <p className="text-sm tabular-nums text-muted-foreground">
          {snapCount > 0 ? `${selectedSnap + 1} / ${snapCount}` : ""}
        </p>
      </div>
    </div>
  );
}

export function PostCard({
  post,
  hidePostLink = false,
}: {
  post: PostResponse
  /** When true, hides the comment-count link to the post (e.g. on the post detail page). */
  hidePostLink?: boolean
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Link to="/user/$username" params={{ username: post.username }}>
          <Avatar className="size-9">
            {post.avatar_url && (
              <AvatarImage src={post.avatar_url} alt={post.name} />
            )}
            <AvatarFallback>
              {post.name[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0">
          <Link
            to="/user/$username"
            params={{ username: post.username }}
            className="truncate hover:underline"
          >
            <span className="font-medium">{post.name}</span>{" "}
            <span className="font-normal text-muted-foreground">
              @{post.username}
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      </CardHeader>

      {post.text_content && (
        <CardContent className="pb-2 pt-0">
          <p className="whitespace-pre-wrap text-sm">{post.text_content}</p>
        </CardContent>
      )}

      {post.images.length > 0 && (
        <div className="px-4 pb-2">
          <PostImagesCarousel images={post.images} />
        </div>
      )}

      <CardFooter className="flex items-center gap-2 pt-0">
        <LikeButton post={post} />
        {!hidePostLink && (
          <Link
            to="/post/$id"
            params={{ id: String(post.post_id) }}
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Button variant="secondary" size="sm" className="gap-1.5 w-16" asChild>
              <Comment className="size-4 shrink-0" />
              <span className="text-xs tabular-nums">{post.comment_count}</span>
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
