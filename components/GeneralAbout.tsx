"use client";

import { useEffect, useState } from "react";
import type { SanityDocument } from "next-sanity";
import { client } from "@/sanity/lib/client";

export default function GeneralAbout() {
  const [about, setAbout] = useState<SanityDocument | null>(null);

  useEffect(() => {
    async function fetchAbout() {
      const query = `*[_type == "about"][0]{
        _id,
        title,
        description
      }`;
      const data = await client.fetch<SanityDocument>(query);
      setAbout(data);
    }
    fetchAbout();
  }, []);

  return (
    <div className="min-h-[100dvh] p-8 flex flex-col justify-center">
      <div className="flex flex-col gap-4">
        <h1 className="max-w-[278px]">{about?.title}</h1>
        <p className="max-w-[465px]">{about?.description}</p>
      </div>
    </div>
  );
}
