"use client";

import { useQuery } from "@tanstack/react-query";
import type { TripAffiliateDto, TripDetailDto } from "@medi/types";
import { api } from "@/lib/api";
import { Card, Spinner } from "@/components/ui";

export function BookingsTab({ trip }: { trip: TripDetailDto }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["affiliate", trip.id],
    queryFn: () => api<TripAffiliateDto>(`/trips/${trip.id}/affiliate`),
  });

  const dest = trip.destination.split(",")[0].trim();
  const hasAffiliate = data?.partners.some((p) => p.hasAffiliateId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16 text-sm font-semibold text-[#8A7563]">
        Không tải được gợi ý đặt chỗ. Thử lại sau.
      </div>
    );
  }

  const lodging = data.partners.filter((p) => p.category === "lodging");
  const flights = data.partners.filter((p) => p.category === "flights");
  const activities = data.partners.filter((p) => p.category === "activities");

  return (
    <div className="space-y-8 text-left max-w-3xl">
      <div>
        <h2 className="text-lg font-display font-extrabold text-[#2B2118]">Đặt chỗ 🎫</h2>
        <p className="text-sm font-semibold text-[#8A7563] mt-1">
          Tìm khách sạn, vé máy bay và trải nghiệm cho chuyến đi {dest}
        </p>
      </div>

      {data.placeDeals.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-display font-extrabold text-[#2B2118]">Gợi ý theo lịch trình ✨</h3>
          <div className="space-y-3">
            {data.placeDeals.map((deal) => (
              <Card key={deal.placeId} className="p-4 border-2 border-[#F3E3D3] bg-white">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#2B2118]">{deal.placeName}</p>
                    {deal.dayLabel && (
                      <p className="text-[10px] font-bold text-[#8A7563] mt-0.5">{deal.dayLabel}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deal.deals.map((d) => (
                      <a
                        key={d.id}
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand-600 hover:bg-brand-100 transition-colors"
                      >
                        <span>{d.emoji}</span>
                        <span>{d.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <PartnerSection title="Lưu trú 🏨" partners={lodging} />
      <PartnerSection title="Vé máy bay ✈️" partners={flights} />
      <PartnerSection title="Tour & trải nghiệm 🎟️" partners={activities} />

      <Card className="p-4 border-2 border-dashed border-[#F3E3D3] bg-[#FFF9F2]">
        <p className="text-xs font-bold text-[#8A7563]">
          {hasAffiliate
            ? "💡 Mê Đi liên kết affiliate — bạn đặt qua link này, nhóm vẫn được giá tốt và app có thêm động lực phát triển!"
            : "💡 Link đặt chỗ được tạo theo điểm đến và ngày đi của chuyến. Thêm mã affiliate vào .env để bật tracking hoa hồng."}
        </p>
      </Card>
    </div>
  );
}

function PartnerSection({
  title,
  partners,
}: {
  title: string;
  partners: TripAffiliateDto["partners"];
}) {
  if (partners.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-display font-extrabold text-[#2B2118]">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {partners.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-5 border-2 border-[#F3E3D3] bg-white hover:shadow-md hover:border-brand-500/30 transition-all h-full">
              <span className="text-3xl">{p.emoji}</span>
              <p className="font-display font-extrabold text-[#2B2118] mt-2">{p.name}</p>
              <p className="text-xs font-semibold text-[#8A7563] mt-1">{p.description}</p>
              <p className="text-xs font-bold text-brand-500 mt-3">Mở trang đặt chỗ →</p>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}
