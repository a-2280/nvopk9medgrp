"use client";

import { useEffect, useState } from "react";
import type { SanityDocument } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle } from "./ui/card";

export default function K0Bios() {
  const [dogs, setDogs] = useState<SanityDocument[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchDogs() {
      const query = `*[_type == "dogs"][0...5]{
        _id,
        k9,
        images
      }`;
      const data = await client.fetch<SanityDocument[]>(query);
      setDogs(data);
    }
    fetchDogs();
  }, []);

  const handleCardClick = (dogName: string) => {
    // Create a URL-friendly slug from the dog name
    const slug = dogName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/dogs/${slug}`);
  };

  const handleSeeMore = () => {
    // Navigate to a random dog
    if (dogs.length > 0) {
      const randomDog = dogs[Math.floor(Math.random() * dogs.length)];
      const slug = randomDog.k9.toLowerCase().replace(/\s+/g, "-");
      router.push(`/dogs/${slug}`);
    }
  };

  return (
    <div className="min-h-[100dvh] p-8 flex justify-start items-center">
      <div className="flex-1">
        <h1>K9 Bios</h1>
      </div>
      <div className="flex-2 grid grid-cols-3 grid-rows-2 gap-[10px]">
        {dogs.map((dog) => (
          <Card
            key={dog._id}
            className="h-[150px] cursor-pointer relative overflow-hidden"
            onClick={() => handleCardClick(dog.k9)}
          >
            {dog.images && dog.images[0] && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${urlFor(dog.images[0]).width(400).height(300).url()})`,
                }}
              >
                <div className="absolute inset-0 bg-black/30" />
              </div>
            )}
            <CardHeader className="h-full w-full flex justify-center items-center relative z-10">
              <CardTitle className="text-white">{dog.k9}</CardTitle>
            </CardHeader>
          </Card>
        ))}
        <Button className="h-[150px]" onClick={handleSeeMore}>
          See more
        </Button>
      </div>
    </div>
  );
}
