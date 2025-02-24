"use client";

import { BilibiliVideo } from "@/components/BilibiliVideo";
import { TranslationExercise } from "@/components/TranslationExercise";
import { videoList } from "@/lib/videoResource";
import {
  addSuccessLesson,
  AppDispatch,
  AppStateType,
  setLastLesson,
} from "@/redux/reduxProvider";
import { ChevronsLeftIcon, ChevronsRightIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Page() {
  const { episode } = useParams();
  const [dialog, setDialog] = useState<{ zh: string; en: string }[]>([]);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const video = videoList.find((v) => v.title === `day-${episode}`);
  const dispatch = useDispatch<AppDispatch>();
  const successLessons = useSelector(
    (state: AppStateType) => state.app.successLessons,
  );
  const successCount =
    successLessons.find((lesson) => lesson.lesson === Number(episode))
      ?.successCount || 0;

  useEffect(() => {
    dispatch(setLastLesson(Number(episode)));
  }, [episode, dispatch]);

  useEffect(() => {
    const loadDialog = async () => {
      try {
        const response = await fetch(`/dialogs/1-${episode}.json`);
        const data = await response.json();
        setDialog(data);
      } catch (error) {
        console.error("Error loading dialog:", error);
      }
    };

    loadDialog();
  }, [episode]);

  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="mb-6 mt-6 flex flex-col text-center font-peppa-pig text-4xl font-bold lg:mt-0">
        <span>
          {episode} - {exerciseStarted ? dialog?.[0]?.zh : dialog?.[0]?.en}
        </span>
        {successCount > 0 && (
          <span className="mt-4 flex flex-row items-center self-center text-yellow-500">
            <StarIcon className="h-10 w-10" />
            <span className="ml-2">{successCount}</span>
          </span>
        )}
      </h1>

      <BilibiliVideo aid={video?.aid} className="w-full" />

      <TranslationExercise
        className="mt-10"
        dialogs={dialog}
        onStart={() => {
          setExerciseStarted(true);
        }}
        onSuccess={() => {
          dispatch(addSuccessLesson({ lesson: Number(episode) }));
        }}
      />

      <div className="mt-6 flex w-full flex-row items-center border-t-2 border-gray-200 pt-2">
        {Number(episode) > 1 && (
          <Link
            href={`/exercise/${Number(episode) - 1}`}
            className="flex flex-row items-center"
          >
            <ChevronsLeftIcon className="h-10 w-10" />
            <span className="font-peppa-pig text-2xl font-bold">
              Previous Lesson
            </span>
          </Link>
        )}

        {Number(episode) < 52 && (
          <Link
            href={`/exercise/${Number(episode) + 1}`}
            className="ml-auto mr-0 flex flex-row items-center"
          >
            <span className="font-peppa-pig text-2xl font-bold">
              Next Lesson
            </span>
            <ChevronsRightIcon className="h-10 w-10" />
          </Link>
        )}
      </div>
    </div>
  );
}
