import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export default function ServicesAndEvents() {
  return (
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
  );
}
