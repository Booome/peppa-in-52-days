import { cn } from "@/lib/utils";

export function BilibiliVideo({
  className,
  aid,
  autoplay = false,
  muted = false,
}: {
  className?: string;
  aid?: string;
  autoplay?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn("aspect-video", className)}>
      <iframe
        className="h-full w-full"
        src={`https://player.bilibili.com/player.html?isOutside=true&aid=${aid}&autoplay=${autoplay}&muted=${muted}&danmaku=false`}
        allowFullScreen={true}
      />
    </div>
  );
}

// doc: https://player.bilibili.com/
// explanple "https://player.bilibili.com/player.html?isOutside=true&aid=597940053&bvid=BV1gB4y1B7CC&cid=776179970&p=1&autoplay=true&muted=true&danmaku=false"
