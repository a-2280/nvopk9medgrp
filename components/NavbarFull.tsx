"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import Link from "next/link";

export default function NavbarFull() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full flex justify-between items-center p-8 z-50">
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
      <div className="flex gap-8 justify-center items-center">
        <ModeToggle />
        <ul className="flex gap-3">
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
