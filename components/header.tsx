import favicon from "@/public/favicon.png";
import Link from "next/link";
import { GithubLink } from "./githubLink";

export function Header() {
  return (
    <header className="flex w-screen items-center justify-between bg-foreground/5 px-4 py-2">
      <Link href="/" className="flex items-center">
        <img src={favicon.src} alt="favicon" className="h-8 w-8" />
        <p className="ml-2 font-peppa-pig text-xl font-bold text-pink-300 [text-shadow:0_0_10px_rgba(0,0,0,0.7)]">
          Peppa in 52 Days
        </p>
      </Link>

      <GithubLink href="https://github.com/Booome/peppa-in-52-days" />
    </header>
  );
}
