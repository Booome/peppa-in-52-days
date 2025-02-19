import { coverCardThumbs } from "@/lib/coverCardThumbs";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function ExerciseCard({
  index,
  className,
  enabled = true,
}: {
  index: number;
  className?: string;
  enabled?: boolean;
}) {
  const key = `1-${index}`;
  const keyExists = key in coverCardThumbs;
  const exerciseHref =
    keyExists && enabled ? `/exercise/${index}` : "/exercise";

  return (
    <Link
      href={exerciseHref}
      className={cn(
        "flex-shrink-0 overflow-hidden rounded-xl border-2 border-background/10 bg-foreground/10",
        className,
      )}
    >
      {keyExists ? (
        <Image
          src={coverCardThumbs[`1-${index}` as keyof typeof coverCardThumbs]}
          alt="cover card"
          width={600}
          height={600}
          className="h-full w-full object-cover object-right"
        />
      ) : (
        <div className="h-full w-full"></div>
      )}
    </Link>
  );
}
