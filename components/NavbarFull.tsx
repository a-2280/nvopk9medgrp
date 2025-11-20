"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import type { SanityDocument } from "next-sanity";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import Link from "next/link";
import { Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { client } from "@/sanity/lib/client";

interface NavbarFullProps {
  onOpenContact?: () => void;
}

export default function NavbarFull({ onOpenContact }: NavbarFullProps = {}) {
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

  return (
    <nav
      className={`fixed lg:static ${isBannerVisible ? "lg:pt-15" : ""} top-0 left-0 w-full flex justify-between items-center p-8 pt-4 lg:pt-8 z-50`}
    >
      <Link href="/">
        {mounted ? (
          <Image
            src={resolvedTheme === "dark" ? "/whiteLogo.svg" : "/Logo.svg"}
            alt="Logo"
            width={151}
            height={38}
          />
        ) : (
          <div style={{ width: 151, height: 38 }} />
        )}
      </Link>
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
