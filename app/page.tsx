import { BilibiliVideo } from "@/components/BilibiliVideo";
import { ExerciseStack } from "@/components/ExerciseStack";
import { tutorialEntryUrl, videoList } from "@/lib/videoResource";
import { ChevronsRightIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-[90vh] flex-col justify-around">
      <div className="flex flex-col">
        <div className="flex w-full flex-auto flex-col p-2 lg:flex-none lg:flex-row lg:items-center lg:p-0">
          <h1 className="flex h-36 flex-col items-center justify-center font-peppa-pig text-2xl font-bold tracking-wider text-pink-300 [text-shadow:0_0_10px_rgba(0,0,0,0.9)] lg:text-6xl/snug">
            Memorize Peppa Pig in 52 Days
          </h1>

          <div className="flex w-full flex-col justify-center lg:w-1/2 lg:max-w-[640px] lg:justify-center">
            <BilibiliVideo aid={videoList[0].aid} className="w-full" />
          </div>
        </div>
        <div className="flex flex-row items-center justify-end font-peppa-pig text-base">
          <Link
            href={tutorialEntryUrl}
            target="_blank"
            className="m-1 ml-4 rounded-lg border-2 border-black bg-yellow-700 p-2"
          >
            Go to Original Course
          </Link>
        </div>
      </div>

      <div className="flex flex-col">
        <ExerciseStack className="mb-4 mt-10 h-64 min-h-64 w-full" />
        <Link
          href="/exercise/"
          className="ml-auto mr-0 flex flex-row items-center rounded-lg border-2 border-black bg-yellow-700 p-2 font-peppa-pig text-base"
        >
          <span>List all lessons</span>
          <ChevronsRightIcon className="h-10 w-10" />
        </Link>
      </div>
    </div>
  );
}
