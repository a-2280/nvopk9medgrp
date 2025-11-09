"use client";

import { useEffect, useRef, useState } from "react";
import DogCarousel from "@/components/DogCarousel";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import { client } from "@/lib/sanity.client";
import type { Dog } from "@/types/sanity";
import K9Bios from "@/components/K9Bios";
import GeneralAbout from "@/components/GeneralAbout";
import Hero from "@/components/Hero";
import MeetTheTeam from "@/components/MeetTheTeam";

export default function Home() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const meetTeamRef = useRef<HTMLDivElement>(null);

  // Expand/contract content based on MeetTheTeam visibility and scroll direction
  useEffect(() => {
    let lastY = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const currentY = entry.boundingClientRect.y;
        const scrollingUp = currentY > lastY;

        if (entry.isIntersecting) {
          setIsExpanded(true);
        } else if (scrollingUp) {
          // Only shrink when scrolling up past MeetTheTeam
          setIsExpanded(false);
        }

        lastY = currentY;
      },
      { threshold: 0.1 }
    );

    if (meetTeamRef.current) {
      observer.observe(meetTeamRef.current);
    }

    return () => {
      if (meetTeamRef.current) {
        observer.unobserve(meetTeamRef.current);
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
        <Navbar isExpanded={isExpanded} onOpenContact={() => setIsContactFormOpen(true)} />
        <Hero />
        <GeneralAbout />
        <div ref={meetTeamRef}>
          <MeetTheTeam />
        </div>
        <K9Bios />
      </div>
      <DogCarousel isExpanded={isExpanded} dogs={dogs} />
      <Footer onOpenContact={() => setIsContactFormOpen(true)} />
      {isContactFormOpen && <ContactForm onClose={() => setIsContactFormOpen(false)} />}
    </div>
  );
}
