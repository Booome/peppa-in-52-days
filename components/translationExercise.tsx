import { cn, grammaticalDiff } from "@/lib/utils";
import { Change } from "diff";
import { CircleDot, MicIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Toggle } from "./ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const Recognition: { new (): SpeechRecognition } | null =
  (typeof window !== "undefined" && window.SpeechRecognition) ||
  window.webkitSpeechRecognition;

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

function DiffRenderer({
  changes,
  showAdded = true,
  showRemoved = true,
}: {
  changes: Change[];
  showAdded?: boolean;
  showRemoved?: boolean;
}) {
  return changes
    .map((part, index) => {
      let className = "text-green-400";

      if (part.added) {
        if (!showAdded) {
          return null;
        }
        className = part.value.match(/^\s+$/)
          ? "bg-yellow-400"
          : "text-yellow-400";
      } else if (part.removed) {
        if (!showRemoved) {
          return null;
        }
        className = part.value.match(/^\s+$/) ? "bg-red-400" : "text-red-400";
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
    "mt-4 font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-100 w-4/5 lg:w-fit";
  const [diff, setDiff] = useState<Change[]>([]);
  const recognition = useMemo(
    () => (Recognition ? new Recognition() : null),
    [],
  );
  const [recognitionStarted, setRecognitionStarted] = useState(false);

  useEffect(() => {
    if (recognition) {
      recognition.continuous = true;
      recognition.onresult = (e) => {
        setInput(
          (prev) => prev + e.results[e.results.length - 1][0].transcript + " ",
        );
      };
    }
  }, [recognition]);

  const advanceState = useCallback(() => {
    const advanceOkState = () => {
      setState(PlaygroundState.Input);
      setInput("");
      setIndex((prev) => prev + 1);
      setCurrentErrorCount(0);

      if (index >= dialogs.length - 1 && correctCount == 0) {
        onSuccess?.();
      }
    };

    const advanceErrorState = () => {
      setState(PlaygroundState.Input);
      setInput("");
    };

    const advanceInputState = () => {
      if (input.length === 0) {
        setHightlightInput(false);
        setTimeout(() => setHightlightInput(true), 1);
        return;
      }
      const diff = grammaticalDiff(dialogs[index].en, input);
      setDiff(diff);
      console.log("Diff:", diff);

      if (!diff.find((part) => part.added || part.removed)) {
        setState(PlaygroundState.ConfirmOK);
        if (currentErrorCount === 0) {
          setCorrectCount((prev) => prev + 1);
        }
        advanceOkState();
      } else {
        setState(PlaygroundState.ConfirmError);
        setCurrentErrorCount((prev) => prev + 1);
        setTotalErrorCount((prev) => prev + 1);
      }
    };

    switch (state) {
      case PlaygroundState.Input:
        advanceInputState();
        break;
      case PlaygroundState.ConfirmError:
        advanceErrorState();
        break;
      case PlaygroundState.ConfirmOK:
        advanceOkState();
        break;
    }
  }, [
    correctCount,
    currentErrorCount,
    dialogs,
    index,
    input,
    onSuccess,
    state,
  ]);

  const restart = useCallback(() => {
    setIndex(0);
    setCorrectCount(0);
    setCurrentErrorCount(0);
    setTotalErrorCount(0);
    setState(PlaygroundState.Input);
    setInput("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1);
  }, []);

  useEffect(() => {
    if (state === PlaygroundState.Input) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "Enter") {
        restart();
      } else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "Enter") {
        advanceState();
      } else if (e.ctrlKey && !e.shiftKey && e.altKey && e.key === "9") {
        if (recognitionStarted) {
          setRecognitionStarted(false);
          recognition?.abort();
        } else {
          setRecognitionStarted(true);
          recognition?.start();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [advanceState, restart, recognition, recognitionStarted]);

  if (index >= dialogs.length) {
    return (
      <div className={cn(containerClassName, "p-10")}>
        <p className="text-center">
          Total: {dialogs.length} / Correct: {correctCount} / Total Error:{" "}
          {totalErrorCount}
        </p>

        <Button className={cn(buttonClassName, "mx-auto")} onClick={restart}>
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
      <div className="relative mt-4 flex h-20 items-start gap-2">
        <span className="pt-2">in: </span>
        {state === PlaygroundState.Input && (
          <>
            <textarea
              ref={inputRef}
              className={cn(
                "h-full w-full resize-none rounded-md border-2 border-background/20 bg-foreground/5 p-2",
                hightlightInput && "animate-shake border-red-400",
              )}
              value={input}
              onChange={(e) => {
                setInput(e.target.value.replace(/\n/g, ""));
                setHightlightInput(false);
                setRecognitionStarted(false);
                recognition?.stop();
              }}
            />
            {recognition && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={recognitionStarted}
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        recognition.start();
                      } else {
                        recognition.abort();
                      }
                      setRecognitionStarted(pressed);
                    }}
                    className="p-06 absolute bottom-2 right-2 size-6 min-w-6 [&_svg]:size-5"
                  >
                    {recognitionStarted ? (
                      <CircleDot className="h-5 w-5 animate-pulse text-red-500" />
                    ) : (
                      <MicIcon className="h-5 w-5" />
                    )}
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  {recognitionStarted ? (
                    <p>Stop voice recognition (Ctrl + Alt + 9)</p>
                  ) : (
                    <p>Start voice recognition (Ctrl + Alt + 9)</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
        {(state === PlaygroundState.ConfirmError ||
          state === PlaygroundState.ConfirmOK) && (
          <p className="h-full w-full rounded-md border-2 border-background/20 bg-foreground/5 p-2">
            <DiffRenderer changes={diff} showAdded={true} showRemoved={true} />
          </p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center lg:flex-row lg:gap-2">
        <Button className={buttonClassName} onClick={advanceState}>
          {(() => {
            switch (state) {
              case PlaygroundState.Input:
                return "Confirm (Enter)";
              case PlaygroundState.ConfirmError:
                return "Try Again (Enter)";
              case PlaygroundState.ConfirmOK:
                return "Next (Enter)";
            }
          })()}
        </Button>

        <Button className={buttonClassName} onClick={restart}>
          Restart (Ctrl + Enter)
        </Button>
      </div>
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
