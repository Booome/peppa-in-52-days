import { cn } from "@/lib/utils";
import { CircleDot, MicIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Toggle } from "./ui/toggle";

const Recognition: { new (): SpeechRecognition } | null =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

export function RecognitionToggle({
  isRecognizing,
  onRecognizingChange,
  onResult,
  onFFTData,
  className,
  disabled,
}: {
  isRecognizing: boolean;
  onRecognizingChange: (recognizing: boolean) => void;
  onResult?: (result: string) => void;
  onFFTData?: (data: Float32Array) => void;
  className?: string;
  disabled?: boolean;
}) {
  const recognition = useMemo(
    () => (Recognition ? new Recognition() : null),
    [],
  );
  const cleanup = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (recognition) {
      recognition.continuous = true;
      recognition.onresult = (e) => {
        onResult?.(e.results[e.results.length - 1][0].transcript);
      };
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onResult, recognition]);

  useEffect(() => {
    (async () => {
      if (isRecognizing) {
        recognition?.start();

        if (onFFTData) {
          let animationFrameId: number;
          const audioContext = new AudioContext();
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          const dataArray = new Float32Array(analyser.frequencyBinCount);
          const processFFT = () => {
            analyser.getFloatFrequencyData(dataArray);
            onFFTData?.(dataArray);
            animationFrameId = requestAnimationFrame(processFFT);
          };
          processFFT();

          cleanup.current = () => {
            cancelAnimationFrame(animationFrameId);
            stream.getTracks().forEach((track) => track.stop());
            audioContext.close();
          };
        }
      } else {
        recognition?.abort();
        cleanup.current?.();
        cleanup.current = undefined;
      }
    })();

    return () => {
      recognition?.abort();
      cleanup.current?.();
      cleanup.current = undefined;
    };
  }, [isRecognizing, recognition, onFFTData]);

  return (
    <Toggle
      pressed={isRecognizing}
      onPressedChange={onRecognizingChange}
      className={cn(
        "p-06 absolute bottom-2 right-2 size-6 min-w-6 hover:bg-background/10 hover:text-background data-[state=on]:bg-transparent data-[state=on]:hover:bg-background/10 [&_svg]:size-5",
        className,
      )}
      disabled={disabled}
    >
      {isRecognizing ? (
        <CircleDot className="h-5 w-5 animate-pulse text-red-500" />
      ) : (
        <MicIcon className="h-5 w-5" />
      )}
    </Toggle>
  );
}
