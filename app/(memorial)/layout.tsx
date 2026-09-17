import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/ken-okonkwo.jpeg";
import AmbientAudio from "./ambient-audio";

export default function MemorialLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="site-header">
        <Link href="/memorial" className="menu-btn">
          <span className="dash" />
          Menu
        </Link>
        <AmbientAudio />
        <div className="header-id">
          <span>Elder Chuka Ken Okonkwo</span>
          <Image src={portrait} alt="" width={40} height={40} sizes="40px" />
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
