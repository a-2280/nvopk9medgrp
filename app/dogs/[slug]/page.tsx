"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SanityDocument } from "next-sanity";
import { Button } from "@/components/ui/button";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export default function DogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [dog, setDog] = useState<SanityDocument | null>(null);
  const [allDogs, setAllDogs] = useState<SanityDocument[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const query = `*[_type == "dogs"] | order(k9 asc) {
        _id,
        k9,
        images,
        bio
      }`;
      const data = await client.fetch<SanityDocument[]>(query);
      setAllDogs(data);

      const currentDog = data.find(
        (d) => d.k9.toLowerCase().replace(/\s+/g, "-") === slug,
      );
      setDog(currentDog || null);
      setCurrentImageIndex(0);
    }
    fetchData();
  }, [slug]);

  if (!dog) return null;

  const images = dog.images || [];
  const hasPrevImage = currentImageIndex > 0;
  const hasNextImage = currentImageIndex < images.length - 1;

  const createSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

  const currentDogIndex = allDogs.findIndex((d) => d._id === dog._id);
  const prevDogData = currentDogIndex > 0 ? allDogs[currentDogIndex - 1] : null;
  const nextDogData =
    currentDogIndex < allDogs.length - 1 ? allDogs[currentDogIndex + 1] : null;

  const handlePrevDog = () => {
    if (prevDogData) {
      router.push(`/dogs/${createSlug(prevDogData.k9)}`);
    }
  };

  const handleNextDog = () => {
    if (nextDogData) {
      router.push(`/dogs/${createSlug(nextDogData.k9)}`);
    }
  };

  const handlePrevious = () => {
    if (hasPrevImage) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNextImage) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div className="w-full h-[100dvh] lg:h-full flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8 max-w-[1400px] mx-auto pt-24 lg:pt-0 pb-8 lg:pb-0">
      <div className="lg:flex-1 flex justify-center items-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePrevDog}
          disabled={!prevDogData}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-center">{dog.k9}</h1>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleNextDog}
          disabled={!nextDogData}
          className="h-10 w-10"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <div className="lg:flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-[300px] h-[400px] lg:w-[500px] lg:h-[600px] bg-background">
          {images[currentImageIndex] && (
            <Image
              src={urlFor(images[currentImageIndex]).url()}
              alt={`${dog.k9} photo ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          )}
        </div>
        <div className="w-full">
          <Button
            variant="link"
            className="bg-transparent border-none p-0 pr-8"
            onClick={handlePrevious}
            disabled={!hasPrevImage}
          >
            Previous
          </Button>
          <Button
            variant="link"
            className="bg-transparent border-none p-0"
            onClick={handleNext}
            disabled={!hasNextImage}
          >
            Next
          </Button>
        </div>
      </div>
      <p className="flex-1 max-w-[400px] max-h-[500px] overflow-scroll no-scrollbar hidden lg:block">
        {dog.bio}
      </p>
    </div>
  );
}
