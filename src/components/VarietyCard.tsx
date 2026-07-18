import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import type { WalnutVariety } from "@/types/walnut";
import { getCategoryName } from "@/lib/knowledge";
import { getVarietyImagePosition } from "@/lib/variety-images";

interface VarietyCardProps {
  variety: WalnutVariety;
}

export default function VarietyCard({ variety }: VarietyCardProps) {
  const { primary, secondary } = getCategoryName(
    variety.primaryCategory,
    variety.secondaryCategory
  );

  return (
    <Link href={`/knowledge/${variety.id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-walnut-100">
        <Image
          src={variety.images[0]}
          alt={variety.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          style={{ objectPosition: getVarietyImagePosition(variety.id) }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="tag">{primary}</span>
          <span className="tag">{secondary}</span>
        </div>
        <h3 className="font-serif text-lg font-semibold text-walnut-900 group-hover:text-walnut-700">
          {variety.name}
        </h3>
        {variety.alias && variety.alias.length > 0 && (
          <p className="mt-0.5 text-xs text-walnut-500">
            又名：{variety.alias.join("、")}
          </p>
        )}
        <p className="mt-2 line-clamp-2 text-sm text-walnut-600">
          {variety.introduction}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-medium text-walnut-800">
            ¥{variety.priceRange.min} - ¥{variety.priceRange.max}
          </span>
          {variety.origin && (
            <span className="flex items-center gap-1 text-walnut-500">
              <MapPin className="h-3 w-3" />
              {variety.origin}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-walnut-700">
          查看详情
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
