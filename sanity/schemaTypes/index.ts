import type { SchemaTypeDefinition } from "sanity";
import { dogs } from "./dogs";
import { hero } from "./hero";
import { about } from "./about";
import { teamMember } from "./teamMember";
import { banner } from "./banner";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [dogs, hero, about, teamMember, banner],
};
