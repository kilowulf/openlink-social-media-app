import UserButton from "@/components/UserButton";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/open_link_logo_favicon.png";
import SearchField from "@/components/SearchField";

export default function Navbar() {
  return (
    <header className="bg-card sticky top-0 z-10 shadow-sm">
      <div className="max-w-7sl mx-auto flex flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link
          href="/"
          className="text-sxl text-primary flex items-center gap-2 font-bold"
        >
          <Image
            src={logo}
            alt=""
            className="bg-secondary flex aspect-square h-[40px] w-[40px] rounded-full object-cover"
          />
          <span>OPENLiNK</span>
        </Link>
        <SearchField />
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}
