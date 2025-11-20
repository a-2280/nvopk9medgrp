"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SanityDocument } from "next-sanity";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { client } from "@/sanity/lib/client";

interface NavbarProps {
  isExpanded?: boolean;
  onOpenContact?: () => void;
}

export default function Navbar({
  isExpanded = false,
  onOpenContact,
}: NavbarProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dogs, setDogs] = useState<SanityDocument[]>([]);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Check if banner was previously closed
    const bannerClosed = localStorage.getItem("topBannerClosed");
    if (bannerClosed === "true") {
      setIsBannerVisible(false);
    }

    // Listen for banner close event
    const handleBannerClose = () => {
      setIsBannerVisible(false);
    };
    window.addEventListener("bannerClosed", handleBannerClose);

    return () => {
      window.removeEventListener("bannerClosed", handleBannerClose);
    };
  }, []);

  useEffect(() => {
    async function fetchDogs() {
      const query = `*[_type == "dogs"][0...5]{
        _id,
        k9
      }`;
      const data = await client.fetch<SanityDocument[]>(query);
      setDogs(data);
    }
    fetchDogs();
  }, []);

  const handleK9TeamsClick = () => {
    if (dogs.length > 0) {
      const randomDog = dogs[Math.floor(Math.random() * dogs.length)];
      const slug = randomDog.k9.toLowerCase().replace(/\s+/g, "-");
      router.push(`/dogs/${slug}`);
    }
  };

  if (!mounted) {
    return (
      <nav
        className={`fixed ${isBannerVisible ? "top-10" : "top-0"} flex justify-between items-center p-8 transition-all duration-700 ease-in-out z-50 ${
          isExpanded ? "w-2/3" : "w-1/2"
        }`}
      >
        <div style={{ width: 151, height: 38 }} />
        <ul className="flex gap-4">
          <li>
            <Button
              variant="link"
              className="bg-transparent border-none p-0"
              onClick={onOpenContact}
            >
              Contact
            </Button>
          </li>
          <li>
            <Button
              variant="link"
              className="bg-transparent border-none p-0"
              onClick={handleK9TeamsClick}
            >
              K9 Teams
            </Button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed ${isBannerVisible ? "top-10" : "top-0"} flex justify-between items-center p-8 transition-all duration-700 ease-in-out z-50 w-full ${
        isExpanded ? "lg:w-2/3" : "lg:w-1/2"
      }`}
    >
      <Image
        src={resolvedTheme === "dark" ? "/whiteLogo.svg" : "/Logo.svg"}
        alt="Logo"
        width={151}
        height={38}
      />
      <div className="hidden lg:flex gap-8 justify-center items-center">
        <ModeToggle />
        <ul className="flex gap-3">
          <li>
            <Button
              variant="link"
              className="bg-transparent border-none p-0"
              onClick={onOpenContact}
            >
              Contact
            </Button>
          </li>
          <li>
            <Button
              variant="link"
              className="bg-transparent border-none p-0"
              onClick={handleK9TeamsClick}
            >
              K9 Teams
            </Button>
          </li>
        </ul>
      </div>
      <div className="lg:hidden">
        <button
          type="button"
          className="m-0 p-0 bg-transparent"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu
            className={resolvedTheme === "dark" ? "text-white" : "text-black"}
          />
        </button>
      </div>
      {isMobileMenuOpen && (
        <MobileMenu
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenContact={onOpenContact}
        />
      )}
    </nav>
  );
}
