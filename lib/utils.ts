import expandContractions from "@stdlib/nlp-expand-contractions";
import { clsx, type ClassValue } from "clsx";
import { Change, diffChars } from "diff";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function standardizeText(text: string) {
  return text
    .replace(/([,.;?!])\s*([a-zA-Z])/g, "$1 $2")
    .replace(/([a-zA-Z!])\s*([,.;?])/g, "$1$2");
}

function isSentenceSeparator(char: string) {
  return [",", ".", ";", "?", "!"].includes(char);
}

export function grammaticalDiff(text1: string, text2: string) {
  const expandedText1 = expandContractions(text1);
  const expandedText2 = expandContractions(text2);

  const standardizedText1 = standardizeText(expandedText1);
  const standardizedText2 = standardizeText(expandedText2);

  const diff = diffChars(standardizedText1, standardizedText2, {
    ignoreCase: true,
  });

  const out: Change[] = [];

  for (let i = 0; i < diff.length; i++) {
    if (i < diff.length - 1) {
      if (
        diff[i].added &&
        isSentenceSeparator(diff[i].value) &&
        diff[i + 1].removed &&
        isSentenceSeparator(diff[i + 1].value)
      ) {
        out.push({ ...diff[i + 1], removed: false });
        i++;
        continue;
      }

      if (
        diff[i].removed &&
        isSentenceSeparator(diff[i].value) &&
        diff[i + 1].added &&
        isSentenceSeparator(diff[i + 1].value)
      ) {
        out.push({ ...diff[i], removed: false });
        i++;
        continue;
      }
    }

    if (
      i === diff.length - 1 &&
      diff[i].removed &&
      diff[i].value.match(/^[.,;?!]+$/)
    ) {
      out.push({ ...diff[i], removed: false });
      continue;
    }

    out.push(diff[i]);
  }

  return out;
}
