"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

interface NavbarProps {
  isExpanded?: boolean;
}

export default function Navbar({ isExpanded = false }: NavbarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav
        className={`fixed top-0 flex justify-between items-center p-8 transition-all duration-700 ease-in-out z-50 ${
          isExpanded ? "w-2/3" : "w-1/2"
        }`}
      >
        <div style={{ width: 151, height: 38 }} />
        <ul className="flex gap-4">
          <li>
            <Button variant="link" className="bg-transparent border-none p-0">
              Contact
            </Button>
          </li>
          <li>
            <Button variant="link" className="bg-transparent border-none p-0">
              Services
            </Button>
          </li>
          <li>
            <Button variant="link" className="bg-transparent border-none p-0">
              K9 Teams
            </Button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 flex justify-between items-center p-8 transition-all duration-700 ease-in-out z-50 ${
        isExpanded ? "w-2/3" : "w-1/2"
      }`}
    >
      <Image
        src={resolvedTheme === "dark" ? "/whiteLogo.svg" : "/Logo.svg"}
        alt="Logo"
        width={151}
        height={38}
      />
      <div className="flex gap-8 justify-center items-center">
        <ModeToggle />
        <ul className="flex gap-4">
          <li>
            <Button variant="link" className="bg-transparent border-none p-0">
              Contact
            </Button>
          </li>
          <li>
            <Button variant="link" className="bg-transparent border-none p-0">
              Services
            </Button>
          </li>
          <li>
            <Button variant="link" className="bg-transparent border-none p-0">
              K9 Teams
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
