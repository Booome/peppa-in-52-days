"use client";

import { cn } from "@/lib/utils";
import { AppStateType } from "@/redux/reduxProvider";
import { useSelector } from "react-redux";
import { ExerciseCard } from "./ExerciseCard";

export function ExerciseStack({ className }: { className?: string }) {
  const lastLesson = useSelector((state: AppStateType) => state.app.lastLesson);

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-background/10 bg-foreground/10 p-2",
        className,
      )}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const realIndex = lastLesson - 2 + index;
        const focused = realIndex === lastLesson;
        return (
          <ExerciseCard
            key={index}
            index={realIndex}
            className={cn(
              "aspect-square h-full",
              focused ? "border-4 border-yellow-500" : "h-[90%]",
            )}
          />
        );
      })}
    </div>
  );
}
