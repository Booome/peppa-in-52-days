import { Change } from "diff";

export function DiffRenderer({
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
