import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SanityDocument } from "next-sanity";
import { Button } from "./ui/button";
import { client } from "@/sanity/lib/client";

interface MobileMenuProps {
  onClose: () => void;
  onOpenContact?: () => void;
}

export default function MobileMenu({
  onClose,
  onOpenContact,
}: MobileMenuProps) {
  const router = useRouter();
  const [dogs, setDogs] = useState<SanityDocument[]>([]);

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
      onClose();
    }
  };
  return (
    <div className="h-[100dvh] w-screen bg-background absolute top-0 left-0 z-40 flex justify-start items-center p-8">
      <ul>
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
        <li>
          <Button
            variant="link"
            className="bg-transparent border-none p-0"
            onClick={onClose}
          >
            Close
          </Button>
        </li>
      </ul>
    </div>
  );
}
