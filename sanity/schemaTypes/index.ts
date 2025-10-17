import { type SchemaTypeDefinition } from "sanity";
import { dogs } from "./dogs";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [dogs],
};
