import githubIcon from "@/public/github-mark.svg";
import Image from "next/image";
import Link from "next/link";

export function GithubLink({ href }: { href: string }) {
  return (
    <Link href={href} target="_blank">
      <Image src={githubIcon} alt="GitHub" width={32} height={32} />
    </Link>
  );
}
