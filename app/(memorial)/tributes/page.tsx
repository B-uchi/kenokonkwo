import type { Metadata } from "next";
import { getTributes } from "@/lib/server/tributes";
import TributeWall from "./tribute-wall";

export const metadata: Metadata = {
  title: "Tributes",
};

export default async function TributesPage() {
  const tributes = await getTributes("approved");

  return (
    <div className="tributes">
      <TributeWall tributes={tributes} />
    </div>
  );
}
