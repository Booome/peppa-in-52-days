import { cn } from "@/lib/utils";
import { useState } from "react";
import { TranslationPlayground } from "./TranslationPlayground";
import { Button } from "./ui/button";

export function TranslationExercise({
  className,
  dialogs,
  onStart,
  onSuccess,
}: {
  className?: string;
  dialogs: {
    zh: string;
    en: string;
  }[];
  onStart?: () => void;
  onSuccess?: () => void;
}) {
  const [started, setStarted] = useState(false);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center overflow-hidden rounded-xl",
        className,
      )}
    >
      {started ? (
        <TranslationPlayground dialogs={dialogs} onSuccess={onSuccess} />
      ) : (
        <StartButton
          onClick={() => {
            setStarted(true);
            onStart?.();
          }}
        />
      )}
    </div>
  );
}

function StartButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        className="bg-yellow-800 font-peppa-pig text-xl uppercase tracking-widest hover:bg-yellow-900"
        onClick={onClick}
      >
        Start Translation Exercise
      </Button>
    </div>
  );
}
