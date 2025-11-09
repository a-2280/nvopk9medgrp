"use client";

import { useEffect, useState } from "react";
import type { SanityDocument } from "next-sanity";
import { client } from "@/sanity/lib/client";
import TeamMember from "./TeamMember";

export default function MeetTheTeam() {
  const [teamMembers, setTeamMembers] = useState<SanityDocument[]>([]);

  useEffect(() => {
    async function fetchTeamMembers() {
      const query = `*[_type == "teamMember"] | order(order asc) {
        _id,
        name,
        jobTitle,
        image,
        bio
      }`;
      const data = await client.fetch<SanityDocument[]>(query);
      setTeamMembers(data);
    }
    fetchTeamMembers();
  }, []);

  return (
    <div className="w-full">
      {teamMembers.map((member, index) => (
        <TeamMember key={member._id} member={member} index={index} />
      ))}
    </div>
  );
}
