import { ExerciseCard } from "@/components/ExerciseCard";
import { coverCardThumbs } from "@/lib/coverCardThumbs";

export default function Page() {
  return (
    <div className="px-4 lg:px-0">
      <h1 className="my-4 font-peppa-pig text-2xl lg:mt-0">All lessons:</h1>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.keys(coverCardThumbs).map((key) => {
          const index = key.split("-")[1];
          return <ExerciseCard key={key} index={Number(index)} />;
        })}
      </div>
    </div>
  );
}
