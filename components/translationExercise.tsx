import { cn } from "@/lib/utils";
import { diffChars } from "diff";
import { useEffect, useRef, useState } from "react";
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
        <Playground dialogs={dialogs} onSuccess={onSuccess} />
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

enum PlaygroundState {
  Input,
  ConfirmError,
  ConfirmOK,
}

function renderDiff(
  text1: string,
  text2: string,
  showAdded = true,
  showRemoved = true,
) {
  const diff = diffChars(text1, text2, {
    ignoreCase: true,
  });
  return diff
    .map((part, index) => {
      let className = "text-green-400";

      if (part.added) {
        if (!showAdded) {
          return null;
        }
        className = part.value === " " ? "bg-yellow-400" : "text-yellow-400";
      } else if (part.removed) {
        if (!showRemoved) {
          return null;
        }
        className = part.value === " " ? "bg-red-400" : "text-red-400";
      }

      return (
        <span key={index} className={className}>
          {part.value}
        </span>
      );
    })
    .filter(Boolean);
}

function Playground({
  dialogs,
  onSuccess,
}: {
  dialogs: { zh: string; en: string }[];
  onSuccess?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [state, setState] = useState<PlaygroundState>(PlaygroundState.Input);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentErrorCount, setCurrentErrorCount] = useState(0);
  const [totalErrorCount, setTotalErrorCount] = useState(0);
  const [hightlightInput, setHightlightInput] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerClassName =
    "flex w-full flex-col rounded-xl border-2 border-yellow-950 bg-yellow-900 p-4 font-peppa-pig text-lg text-background shadow-xl lg:text-2xl";
  const buttonClassName =
    "mt-4 font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-100";

  const advanceState = () => {
    switch (state) {
      case PlaygroundState.Input:
        if (input.length === 0) {
          setHightlightInput(false);
          setTimeout(() => setHightlightInput(true), 10);
          return;
        }
        if (input.toLowerCase() === dialogs[index].en.toLowerCase()) {
          setState(PlaygroundState.ConfirmOK);
          if (currentErrorCount === 0) {
            setCorrectCount((prev) => prev + 1);
          }
        } else {
          setState(PlaygroundState.ConfirmError);
          setCurrentErrorCount((prev) => prev + 1);
          setTotalErrorCount((prev) => prev + 1);
        }
        break;
      case PlaygroundState.ConfirmError:
        setState(PlaygroundState.Input);
        setInput("");
        break;
      case PlaygroundState.ConfirmOK:
        setState(PlaygroundState.Input);
        setInput("");
        setIndex((prev) => prev + 1);
        setCurrentErrorCount(0);

        if (index >= dialogs.length - 1) {
          onSuccess?.();
        }

        break;
    }
  };

  useEffect(() => {
    if (state === PlaygroundState.Input) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [state]);

  useEffect(() => {
    const handleCtrlEnterKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        advanceState();
      }
    };
    window.addEventListener("keydown", handleCtrlEnterKeyDown);

    return () => {
      window.removeEventListener("keydown", handleCtrlEnterKeyDown);
    };
  }, [advanceState]);

  if (index >= dialogs.length) {
    return (
      <div className={cn(containerClassName, "p-10")}>
        <p className="text-center">
          Total: {dialogs.length} / Correct: {correctCount} / Total Error:{" "}
          {totalErrorCount}
        </p>

        <Button
          className={cn(buttonClassName, "mx-auto")}
          onClick={() => {
            setIndex(0);
            setCorrectCount(0);
          }}
        >
          Restart
        </Button>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <p className="text-center text-sm">
        Total: {dialogs.length} / Current: {index + 1} / Correct: {correctCount}{" "}
        / Total Error: {totalErrorCount}
      </p>
      <p className="mt-6">
        zh: <span className="ml-1">{dialogs[index].zh}</span>
      </p>
      <p className="mt-6">
        en:{" "}
        <span className="ml-1">
          {state === PlaygroundState.Input ? "-- --" : dialogs[index].en}
        </span>
      </p>
      <div className="mt-4 flex h-20 items-start gap-2">
        <span className="pt-2">In: </span>
        {state === PlaygroundState.Input && (
          <textarea
            ref={inputRef}
            className={cn(
              "h-full w-full resize-none rounded-md border-2 border-background/20 bg-foreground/5 p-2",
              hightlightInput && "animate-shake border-red-400",
            )}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHightlightInput(false);
            }}
          />
        )}
        {(state === PlaygroundState.ConfirmError ||
          state === PlaygroundState.ConfirmOK) && (
          <p className="h-full w-full rounded-md border-2 border-background/20 bg-foreground/5 p-2">
            {renderDiff(dialogs[index].en, input, true, true)}
          </p>
        )}
      </div>

      <Button className={cn(buttonClassName, "mx-auto")} onClick={advanceState}>
        {(() => {
          switch (state) {
            case PlaygroundState.Input:
              return "Confirm (Ctrl + Enter)";
            case PlaygroundState.ConfirmError:
              return "Try Again (Ctrl + Enter)";
            case PlaygroundState.ConfirmOK:
              return "Next (Ctrl + Enter)";
          }
        })()}
      </Button>
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
