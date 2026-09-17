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
        <p className="hero-alias">(Captain Ken)</p>

        <div className="gold-rule hero-rule" />

        <p className="hero-dates">
          <span>SEPTEMBER 3, 1949 &nbsp;&ndash;&nbsp; SEPTEMBER 10, 2026</span>{" "}
          <span className="hero-age">(77 yrs)</span>
        </p>

        <p className="hero-quote">
          <span>
            An exceptional man who walked with God, led with love and touched countless lives.
          </span>{" "}
          <span>He inspired, uplifted and cared unconditionally.</span>{" "}
          <span>His love lives on through us all.</span>
        </p>

        <Link href="/memorial" className="hero-enter">
          Enter Memorial
          <span className="dash" />
        </Link>
      </main>
    </>
  );
}
