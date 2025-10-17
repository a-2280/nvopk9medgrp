import Image from "next/image";
import { Button } from "./ui/button";

export default function Footer() {
  return (
    <footer className="relative z-20 h-[100dvh] w-screen p-8 flex flex-col gap-8 bg-background">
      <Image
        src="Logo.svg"
        alt="Logo"
        width={151}
        height={38}
        className="invisible"
      />
      <div className="h-full flex gap-8">
        <Button className="flex-1 h-full text-[32px] font-medium">
          Contact us
        </Button>
        <Button className="flex-1 h-full text-[32px] font-medium">
          Donate
        </Button>
      </div>
    </footer>
  );
}
