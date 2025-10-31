"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DogCarousel from "@/components/DogCarousel";
import DonationModal from "@/components/DonationModal";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { client } from "@/lib/sanity.client";
import type { Dog } from "@/types/sanity";

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsExpanded(entry.isIntersecting);
      },
      {
        threshold: 0.25, // Trigger when 10% of the element is visible
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function fetchDogs() {
      const query = `*[_type == "dogs"] | order(_createdAt desc) {
        _id,
        k9,
        officer,
        images[] {
          asset-> {
            _id,
            url
          }
        }
      }`;
      const data = await client.fetch<Dog[]>(query);
      setDogs(data);
    }
    fetchDogs();
  }, []);

  return (
    <div className="w-screen flex flex-col">
      <div
        className={`flex flex-col justify-between transition-all duration-700 ease-in-out ${
          isExpanded ? "w-2/3" : "w-1/2"
        }`}
      >
        <Navbar isExpanded={isExpanded} />
        <div className="h-[100dvh] p-8 flex flex-col justify-between">
          <div className="h-auto w-auto"></div>
          <div className="flex flex-col justify-center items-start gap-8">
            <h1 className="text-[52.75px] max-w-[447px] leading-[62px]">
              Protecting Those Who Protect Us
            </h1>
            <DonationModal>
              <Button>Donate</Button>
            </DonationModal>
          </div>
          <div className="max-w-[400px] flex flex-col gap-[10px]">
            <p className="text-[#707070] text-[14px] font-light">
              // Nevada Operational Canine Medical Group
            </p>
            <p>
              Nonprofit providing emergency medical training and equipment for
              police, military, and SAR dogs injured in the line of duty.
            </p>
          </div>
        </div>
        <div className="min-h-[100dvh] p-8 flex flex-col justify-center">
          <div className="flex flex-col gap-4">
            <h1 className="max-w-[278px]">Why specialized K9 medical care?</h1>
            <p className="max-w-[465px]">
              Working dogs enable critical operations that save lives every
              day—tracking suspects, detecting explosives, finding survivors—but
              current emergency medical infrastructure isn't designed for them:
              field care is either adapted from human protocols or requires
              immediate veterinary transport. Nevada Operational Canine Medical
              Group is a specialized response system designed and built for
              real-world K9 emergencies.
            </p>
          </div>
        </div>
        <div ref={triggerRef}>
          <div className="min-h-[100dvh] p-8 flex items-center justify-start">
            <div className="flex-1">
              <h1 className="max-w-[174px]">Services and Events</h1>
            </div>
            <div className="flex-1 flex flex-col gap-12">
              <div className="flex gap-8">
                <Link
                  href="#"
                  className="font-public-sans text-[24px] underline leading-[28px]"
                >
                  Services
                </Link>
                <Link
                  href="#"
                  className="font-public-sans text-[24px] underline leading-[28px] text-gray-300"
                >
                  Events
                </Link>
              </div>
              <div className="flex-1 flex flex-col gap-[10px]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>Card Title</CardTitle>
                      <CardDescription>Card Description</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
                <Button className="h-[94px]">View more</Button>
              </div>
            </div>
          </div>
          <div className="min-h-[100dvh] p-8 flex justify-start items-center">
            <div className="flex-1">
              <h1>K9 Bios</h1>
            </div>
            <div className="flex-2 grid grid-cols-3 grid-rows-2 gap-[10px]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="h-[150px]">
                  <CardHeader className="h-full w-full flex justify-center items-center">
                    <CardTitle>Dog name</CardTitle>
                  </CardHeader>
                </Card>
              ))}
              <Button className="h-[150px]">See more</Button>
            </div>
          </div>
        </div>
      </div>
      <DogCarousel isExpanded={isExpanded} dogs={dogs} />
      <Footer />
    </div>
  );
}
