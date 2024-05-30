import Link from "next/link";
import Github from "./GitHub";
import { FaPencil } from "react-icons/fa6";
import { H1 } from "./ui/typography";

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2">
      <Link href="/" className="flex space-x-3">
        <FaPencil className="fill-white mt-2" size={35} />
        {/* <h1 className="sm:text-3xl text-2xl font-bold ml-2 tracking-tight">
          TwitterCraft
        </h1> */}
        <H1 className="font-bold sm:text-3xl ml-1 text-white">TwitterCraft</H1>
      </Link>
      <a
        className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 shadow-md transition-colors hover:bg-gray-100 md:px-4 md:py-2 md:text-sm"
        href="https://github.com/Zaidbhati10114/twitter-craft"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github className="w-4 h-4 md:w-5 md:h-5" />
        <p>Star on GitHub</p>
      </a>
    </header>
  );
}
