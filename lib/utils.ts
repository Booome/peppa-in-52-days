import expandContractions from "@stdlib/nlp-expand-contractions";
import { clsx, type ClassValue } from "clsx";
import { diffWords } from "diff";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function standardizeText(text: string) {
  return text.replace(/([,.;?])\s*([a-zA-Z])/g, "$1 $2");
}

export function grammaticalDiff(text1: string, text2: string) {
  const expandedText1 = expandContractions(text1);
  const expandedText2 = expandContractions(text2);

  const standardizedText1 = standardizeText(expandedText1);
  const standardizedText2 = standardizeText(expandedText2);

  console.log(text1, expandedText1, standardizedText1);
  console.log(text2, expandedText2, standardizedText2);

  return diffWords(standardizedText1, standardizedText2, {
    ignoreCase: true,
  });
}
