import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { components } from "@/lib/api/schema";

type PostResponse = components["schemas"]["PostResponse"];

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
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {post.images.map((img) => (
                <CarouselItem key={img.image_id} className="basis-full pl-2">
                  <img
                    src={img.url}
                    alt=""
                    className="h-48 w-full rounded-md object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {post.images.length > 1 && (
              <>
                <CarouselPrevious className="left-1 top-1/2 size-8 -translate-y-1/2 border bg-background/80 shadow-sm" />
                <CarouselNext className="right-1 top-1/2 size-8 -translate-y-1/2 border bg-background/80 shadow-sm" />
              </>
            )}
          </Carousel>
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
