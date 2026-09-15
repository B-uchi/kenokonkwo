import type { Metadata } from "next";
import { initialTributes } from "@/lib/tributes";
import TributeWall from "./tribute-wall";

export const metadata: Metadata = {
  title: "Tributes",
};

export default function TributesPage() {
  return (
    <div className="tributes">
      <TributeWall initialTributes={initialTributes} />
    </div>
  );
}
