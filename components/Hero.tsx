"use client";

import { useEffect, useState } from "react";
import type { SanityDocument } from "next-sanity";
import { client } from "@/sanity/lib/client";
import DonationModal from "./DonationModal";
import { Button } from "./ui/button";

export default function Hero() {
  const [hero, setHero] = useState<SanityDocument | null>(null);

  useEffect(() => {
    async function fetchHero() {
      const query = `*[_type == "hero"][0]{
        _id,
        title,
        button,
        descriptionTitle,
        description
      }`;
      const data = await client.fetch<SanityDocument>(query);
      setHero(data);
    }
    fetchHero();
  }, []);

  return (
    <div className="h-[100dvh] p-8 flex flex-col justify-between">
      <div className="h-auto w-auto"></div>
      <div className="flex flex-col justify-center items-start gap-8">
        <h1 className="text-[52.75px] max-w-[447px] leading-[62px]">
          {hero?.title}
        </h1>
        <DonationModal>
          <Button>{hero?.button}</Button>
        </DonationModal>
      </div>
      <div className="max-w-[400px] flex flex-col gap-[10px]">
        <p className="text-[#707070] text-[14px] font-light">
          {hero?.descriptionTitle}
        </p>
        <p>
          {hero?.description}
        </p>
      </div>
    </div>
  );
}
