import { grammaticalDiff } from "@/lib/grammaticalDiff";
import { cn } from "@/lib/utils";
import loadingGif from "@/public/loading.gif";
import { Change } from "diff";
import { MicIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDebouncedCallback } from "use-debounce";
import { DiffRenderer } from "./DiffRenderer";
import { RecognitionToggle } from "./RecognitionToggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

enum PlaygroundState {
  Input,
  Error,
}

export function TranslationPlayground({
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
    "mt-4 font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-100 w-4/5 lg:w-1/4";
  const [diff, setDiff] = useState<Change[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawFFT = useCallback((fftData: Float32Array) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    const barWidth = canvas.width / fftData.length;
    let posX = 0;
    const centerY = canvas.height / 2;

    for (let i = 0; i < fftData.length; i++) {
      const barHeight = (fftData[i] + 140) * 1.5;
      ctx.fillStyle = "rgba(50, 205, 50, 0.5)";
      ctx.fillRect(posX, centerY - barHeight / 2, barWidth, barHeight / 2);
      ctx.fillRect(posX, centerY, barWidth, barHeight / 2);
      posX += barWidth;
    }
  }, []);

  const onRecognitionResult = useCallback(
    (result: string) => {
      if (isBusy || !isRecognizing) {
        return;
      }
      const selectionStart = inputRef.current?.selectionStart;
      const selectionEnd = inputRef.current?.selectionEnd;
      const text = inputRef.current?.value;

      setInput(
        text?.slice(0, selectionStart) + result + text?.slice(selectionEnd),
      );
      setHightlightInput(false);

      setTimeout(() => {
        if (inputRef.current && typeof selectionStart === "number") {
          inputRef.current.selectionStart = selectionStart + result.length;
          inputRef.current.selectionEnd = inputRef.current.selectionStart;
        }
      }, 10);
    },
    [isBusy, isRecognizing],
  );

  const toInputState = useCallback(() => {
    setState(PlaygroundState.Input);
    setInput("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const startRecognition = useDebouncedCallback((value: boolean) => {
    setIsRecognizing(value);

    if (value && state !== PlaygroundState.Input) {
      setState(PlaygroundState.Input);
      setInput("");
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, 100);

  const advanceState = useCallback(async () => {
    const advanceInputState = async () => {
      if (input.length === 0) {
        setHightlightInput(false);
        setTimeout(() => setHightlightInput(true), 1);
        return;
      }
      const diff = await grammaticalDiff(dialogs[index].en, input);
      setDiff(diff);

      if (!diff.find((part) => part.added || part.removed)) {
        if (index >= dialogs.length - 1 && totalErrorCount == 0) {
          onSuccess?.();
        } else {
          if (currentErrorCount === 0) {
            setCorrectCount((prev) => prev + 1);
          }
          setIndex((prev) => prev + 1);
          setCurrentErrorCount(0);
          toInputState();
        }
      } else {
        setState(PlaygroundState.Error);
        setCurrentErrorCount((prev) => prev + 1);
        setTotalErrorCount((prev) => prev + 1);

        startRecognition(false);
      }
    };

    const advanceErrorState = () => {
      toInputState();
    };

    startRecognition(false);
    setIsBusy(true);
    try {
      switch (state) {
        case PlaygroundState.Input:
          await advanceInputState();
          break;
        case PlaygroundState.Error:
          advanceErrorState();
          break;
      }
    } finally {
      setIsBusy(false);
    }
  }, [
    currentErrorCount,
    dialogs,
    index,
    input,
    onSuccess,
    startRecognition,
    state,
    toInputState,
    totalErrorCount,
  ]);

  const restart = useCallback(() => {
    setIndex(0);
    setCorrectCount(0);
    setCurrentErrorCount(0);
    setTotalErrorCount(0);
    toInputState();
    setIsRecognizing(false);
  }, [toInputState]);

  useHotkeys(
    "ctrl+enter",
    () => {
      if (!isBusy) {
        restart();
      }
    },
    { enableOnFormTags: ["textarea"] },
  );

  useHotkeys(
    "enter",
    () => {
      if (!isBusy) {
        advanceState();
      }
    },
    { enableOnFormTags: ["textarea"] },
  );

  useHotkeys(
    "ctrl+alt+9",
    () => {
      if (!isBusy) {
        startRecognition(!isRecognizing);
      }
    },
    { enableOnFormTags: ["textarea"] },
  );

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
    <div className={cn(containerClassName, "relative")}>
      {isBusy && (
        <div className="absolute left-1/2 top-1/2 z-10 flex size-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/50">
          <Image
            src={loadingGif}
            alt="Loading"
            width={100}
            height={100}
            className="-mt-9 size-40"
          />
        </div>
      )}

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
      <div
        className="relative mt-4 flex h-20 items-start gap-2"
        onClick={() => {
          if (isRecognizing) {
            startRecognition(false);
          }
        }}
      >
        <span className="pt-2">in: </span>

        {state === PlaygroundState.Input && (
          <>
            <textarea
              ref={inputRef}
              className={cn(
                "h-full w-full resize-none rounded-md border-2 border-background/20 bg-foreground/5 p-2 focus:outline-none",
                {
                  "animate-shake border-red-400": hightlightInput,
                  "text-muted/50": isRecognizing || isBusy,
                },
              )}
              readOnly={isBusy}
              disabled={isBusy}
              value={input}
              onChange={(e) => {
                setInput(e.target.value.replace(/\n/g, ""));
                setHightlightInput(false);
                startRecognition(false);
              }}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight", "Escape"].includes(e.key)) {
                  startRecognition(false);
                }
              }}
            />
            {isRecognizing && (
              <div className="absolute left-0 top-0 h-full w-full rounded-lg">
                <canvas
                  ref={canvasRef}
                  className="pointer-events-none absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow"
                />
                <MicIcon className="pointer-events-none absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              </div>
            )}
          </>
        )}

        {state === PlaygroundState.Error && (
          <p
            className="h-full w-full rounded-md border-2 border-background/20 bg-foreground/5 p-2"
            onDoubleClick={toInputState}
          >
            <DiffRenderer changes={diff} showAdded={true} showRemoved={true} />
          </p>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <RecognitionToggle
              className="p-06 absolute bottom-2 right-2"
              isRecognizing={isRecognizing}
              onRecognizingChange={startRecognition}
              disabled={isBusy}
              onResult={onRecognitionResult}
              onFFTData={drawFFT}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isRecognizing ? "Stop" : "Start"} voice recognition ( Ctrl + Alt
              + 9)
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col items-center justify-center lg:flex-row lg:gap-5">
        <Button
          className={buttonClassName}
          onClick={advanceState}
          disabled={isBusy}
        >
          {(() => {
            switch (state) {
              case PlaygroundState.Input:
                return "Confirm (Enter)";
              case PlaygroundState.Error:
                return "Try Again (Enter)";
            }
          })()}
        </Button>

        <Button className={buttonClassName} onClick={restart} disabled={isBusy}>
          Restart (Ctrl + Enter)
        </Button>
      </div>
    </div>
  );
}
