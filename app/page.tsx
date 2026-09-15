import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/ken-okonkwo.jpeg";

export default function IntroPage() {
  return (
    <>
      {/* Full-page door opening — pure CSS keyframes, no JS required */}
      <div className="doors" aria-hidden="true">
        <div className="door door--start" />
        <div className="door door--end" />
        <div className="door-seam" />
      </div>

      <main className="hero">
        <div className="hero-portrait">
          <div className="hero-frame">
            <Image
              src={portrait}
              alt="Elder Chuka Ken Okonkwo"
              sizes="236px"
              quality={85}
              placeholder="blur"
              preload
            />
          </div>
        </div>

        <p className="hero-eyebrow">In Loving Memory</p>

        <h1 className="hero-name">Elder Chuka Ken Okonkwo</h1>

        <div className="gold-rule hero-rule" />

        <p className="hero-dates">
          SEPTEMBER 3, 1949 &nbsp;&ndash;&nbsp; SEPTEMBER 10, 2026
        </p>

        <p className="hero-quote">
          A kind soul who touched our hearts, inspired our lives and will
          forever remain in our memories.
        </p>

        <Link href="/memorial" className="hero-enter">
          Enter Memorial
          <span className="dash" />
        </Link>
      </main>
    </>
  );
}
