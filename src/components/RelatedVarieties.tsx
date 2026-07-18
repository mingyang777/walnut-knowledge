import Image from "next/image";
import Link from "next/link";
import type { WalnutVariety } from "@/types/walnut";
import { getVarietyImagePosition } from "@/lib/variety-images";

interface RelatedVarietiesProps {
  varieties: WalnutVariety[];
  title?: string;
}

export default function RelatedVarieties({
  varieties,
  title = "同类品种推荐",
}: RelatedVarietiesProps) {
  if (varieties.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold text-walnut-900">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {varieties.map((variety) => (
          <Link
            key={variety.id}
            href={`/knowledge/${variety.id}`}
            className="card flex overflow-hidden transition hover:shadow-md"
          >
            <div className="relative h-24 w-24 shrink-0 bg-walnut-100">
              <Image
                src={variety.images[0]}
                alt={variety.name}
                fill
                className="object-cover"
                style={{ objectPosition: getVarietyImagePosition(variety.id) }}
                sizes="96px"
              />
            </div>
            <div className="flex flex-col justify-center p-3">
              <h3 className="font-medium text-walnut-900">{variety.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-walnut-600">
                {variety.introduction}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
