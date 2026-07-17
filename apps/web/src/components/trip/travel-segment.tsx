"use client";

import { Car, CornerDownRight, ExternalLink } from "lucide-react";
import { formatDuration, formatMiles, type TravelEstimate } from "@/lib/travel";

/**
 * Connector shown between two consecutive itinerary stops. Renders a dashed
 * line aligned under the place pins plus a mock travel estimate. When
 * `destinationLabel` is set it marks the final leg to the lodging.
 */
export function TravelSegment({
  estimate,
  connectorLeft,
  directionsHref,
  destinationLabel,
}: {
  estimate: TravelEstimate;
  connectorLeft: number;
  directionsHref: string;
  destinationLabel?: string;
}) {
  return (
    <div className="flex items-stretch">
      <div
        className="relative flex shrink-0 justify-center"
        style={{ width: connectorLeft * 2 }}
        aria-hidden
      >
        <span className="border-l-2 border-dashed border-[#D8C6B0]" />
        <span className="absolute left-1/2 top-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8DDD3] bg-white text-[#8A7563] shadow-sm">
          <Car size={11} />
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-center py-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A7563]">
          <span>
            {formatDuration(estimate.minutes)} · {formatMiles(estimate.miles)}
          </span>
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-brand-600 transition-colors hover:bg-[#FFF3EB]"
          >
            Chỉ đường
            <ExternalLink size={11} />
          </a>
        </div>
        {destinationLabel && (
          <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#7C3AED]">
            <CornerDownRight size={12} />
            <span className="truncate">đến {destinationLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
