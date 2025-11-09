import type { SanityDocument } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

export default function TeamMember({
  member,
  index,
}: {
  member: SanityDocument;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`w-full flex p-8 items-center ${isEven ? "" : "flex-row-reverse"}`}
    >
      <div className={`shrink-0 w-1/2 flex flex-col items-center`}>
        <div className="w-fit">
          <h1>{member.name}</h1>
          <h3>{member.jobTitle}</h3>
        </div>
      </div>
      <div className="w-1/2 ml-4 flex flex-col gap-4 justify-center items-center">
        {member.image && (
          <Image
            src={urlFor(member.image).width(300).height(300).url()}
            alt={member.name}
            width={300}
            height={300}
            className="rounded-lg"
          />
        )}
        <div className="text-center">{member.bio}</div>
      </div>
    </div>
  );
}
