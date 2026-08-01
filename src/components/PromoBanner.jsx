import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Image as UIImage } from "@/components/ui/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const AUTOPLAY_MS = 6000;

export default function PromoBanner() {
  const [api, setApi] = useState(null);
  const [selected, setSelected] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ["banners", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  useEffect(() => {
    if (!api || banners.length < 2) return;
    const id = setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [api, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="pt-24 lg:pt-40 bg-cloud" aria-label="Banners promocionais">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6">
        <Carousel setApi={setApi} opts={{ loop: banners.length > 1 }}>
          <CarouselContent>
            {banners.map((banner) => {
              const image = (
                <UIImage
                  src={banner.image_url}
                  alt={banner.alt_text}
                  fittingType="fill"
                  className="w-full aspect-[16/6] sm:aspect-[3/1] rounded-[2rem]"
                />
              );
              return (
                <CarouselItem key={banner.id} className="basis-full">
                  <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-cobalt/10">
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target={banner.link_url.startsWith("/") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {image}
                      </a>
                    ) : (
                      image
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                onClick={() => api?.scrollTo(i)}
                aria-label={`Ir para o banner ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === selected ? "w-8 bg-orange" : "w-2.5 bg-cobalt/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
