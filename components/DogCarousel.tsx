"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { Dog } from "@/types/sanity";

interface DogCarouselProps {
  isExpanded?: boolean;
  dogs: Dog[];
}

export default function DogCarousel({
  isExpanded = false,
  dogs,
}: DogCarouselProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const autoplayRef = useRef(Autoplay({ delay: 2000 }));

  useEffect(() => {
    // Preload all images
    const imageUrls = dogs.flatMap((dog) =>
      dog.images.map((image) => image.asset.url),
    );

    const promises = imageUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(null);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    });

    Promise.all(promises).then(() => {
      setImagesLoaded(true);
    });
  }, [dogs]);

  return (
    <div
      className={`hidden lg:block h-[100dvh] fixed right-0 top-0 transition-all duration-700 ease-in-out ${
        isExpanded ? "w-1/3" : "w-1/2"
      }`}
    >
      <Carousel
        orientation="vertical"
        plugins={imagesLoaded ? [autoplayRef.current] : []}
        className="h-full w-full"
      >
        <CarouselContent className="h-[100dvh]">
          {dogs.map((dog) =>
            dog.images.map((image, idx) => (
              <CarouselItem key={`${dog._id}-${image.asset._id}`}>
                <div className="relative h-[100dvh] w-full bg-background">
                  <Image
                    src={image.asset.url}
                    alt={dog.k9}
                    fill
                    className="object-contain"
                    priority={idx === 0}
                  />
                </div>
              </CarouselItem>
            )),
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
